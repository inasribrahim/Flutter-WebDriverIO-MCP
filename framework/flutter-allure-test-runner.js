const AllureFlutterTestFramework = require('./allure-flutter-framework');

class FlutterTestRunner {
    constructor() {
        this.framework = new AllureFlutterTestFramework();
    }

    async runAllTests(testConfigs = []) {
        console.log('🚀 Starting Flutter Test Suite with Allure Reporting...');
        console.log('=' .repeat(70));
        
        const defaultConfigs = [
            {
                name: 'Valid Login Test',
                description: 'Test login with valid credentials',
                username: 'validuser',
                password: 'validpass123'
            },
            {
                name: 'Invalid Login Test',
                description: 'Test login with invalid credentials',
                username: 'invaliduser',
                password: 'wrongpass'
            },
            {
                name: 'Empty Credentials Test',
                description: 'Test login with empty credentials',
                username: '',
                password: ''
            }
        ];
        
        const configs = testConfigs.length > 0 ? testConfigs : defaultConfigs;
        
        try {
            for (const config of configs) {
                console.log(`\n🧪 Running test: ${config.name}`);
                await this.framework.runLoginTest(config.username, config.password);
                
                // Wait between tests
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // Generate reports
            console.log('\n📊 Generating reports...');
            await this.framework.generateAllureReport();
            await this.framework.generateHTMLReport();
            
            // Display summary
            this.displaySummary();
            
        } catch (error) {
            console.error('💥 Test suite failed:', error.message);
        } finally {
            await this.framework.cleanup();
        }
    }

    async runSingleTest(username = 'testuser', password = 'testpass') {
        console.log('🚀 Starting Single Flutter Test with Allure Reporting...');
        console.log('=' .repeat(70));
        
        try {
            await this.framework.runLoginTest(username, password);
            
            // Generate reports
            console.log('\n📊 Generating reports...');
            await this.framework.generateAllureReport();
            const htmlPath = await this.framework.generateHTMLReport();
            
            // Display summary
            this.displaySummary();
            
            // Return report path for viewing
            return htmlPath;
            
        } catch (error) {
            console.error('💥 Test failed:', error.message);
            throw error;
        } finally {
            await this.framework.cleanup();
        }
    }

    displaySummary() {
        const results = this.framework.testResults;
        const screenshots = this.framework.screenshots;
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 TEST EXECUTION SUMMARY');
        console.log('='.repeat(70));
        console.log(`📋 Total Tests: ${results.length}`);
        console.log(`✅ Passed: ${results.filter(t => t.status === 'passed').length}`);
        console.log(`❌ Failed: ${results.filter(t => t.status === 'failed').length}`);
        console.log(`📸 Screenshots: ${screenshots.length}`);
        console.log(`📁 Report Directory: ${this.framework.reportDir}`);
        console.log(`📸 Screenshot Directory: ${this.framework.screenshotDir}`);
        
        // List all generated files
        console.log('\n📄 Generated Files:');
        console.log(`   - HTML Report: ${this.framework.reportDir}/test-report.html`);
        console.log(`   - Allure Results: ${this.framework.reportDir}/`);
        console.log(`   - Screenshots: ${this.framework.screenshotDir}/`);
        
        // Test details
        results.forEach((test, index) => {
            const statusIcon = test.status === 'passed' ? '✅' : '❌';
            console.log(`\n${statusIcon} Test ${index + 1}: ${test.name}`);
            console.log(`   Status: ${test.status.toUpperCase()}`);
            console.log(`   Duration: ${test.duration}ms`);
            console.log(`   Steps: ${test.steps.length}`);
            console.log(`   Screenshots: ${test.attachments ? test.attachments.length : 0}`);
            
            if (test.status === 'failed' && test.errorMessage) {
                console.log(`   Error: ${test.errorMessage}`);
            }
        });
        
        console.log('\n' + '='.repeat(70));
    }
}

// Main execution function
async function main() {
    const runner = new FlutterTestRunner();
    
    try {
        // Get test parameters from command line
        const testType = process.argv[2] || 'single';
        const username = process.argv[3] || 'testuser';
        const password = process.argv[4] || 'testpass';
        
        if (testType === 'suite') {
            console.log('🎯 Running full test suite...');
            await runner.runAllTests();
        } else {
            console.log(`🎯 Running single test with credentials: ${username} / ${'*'.repeat(password.length)}`);
            const htmlPath = await runner.runSingleTest(username, password);
            
            // Try to open the HTML report
            console.log(`\n🌐 Opening HTML report: ${htmlPath}`);
            console.log('📖 View the complete test report with screenshots in your browser!');
        }
        
        console.log('\n🎉 Test execution completed successfully!');
        
    } catch (error) {
        console.error('💥 Test execution failed:', error.message);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n🛑 Process interrupted, cleaning up...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Process terminated, cleaning up...');
    process.exit(0);
});

// Run if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = FlutterTestRunner;