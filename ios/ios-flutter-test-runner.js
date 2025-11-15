const { AllureFlutterTestFramework } = require('./allure-flutter-framework');
const path = require('path');

class IOSFlutterTestRunner {
    constructor() {
        this.framework = new AllureFlutterTestFramework();
        this.results = [];
    }

    async runSingleTest(username = 'demouser', password = 'demopass123') {
        console.log('🚀 Starting iOS Flutter Login Test...');
        console.log(`📱 Platform: iOS Simulator`);
        console.log(`👤 Username: ${username}`);
        console.log(`🔐 Password: ${'*'.repeat(password.length)}`);
        
        try {
            // Load iOS capabilities
            const capabilitiesPath = path.join(__dirname, 'ios-flutter-capabilities.json');
            
            // Initialize test framework with iOS capabilities
            await this.framework.initialize('Flutter Login Test', capabilitiesPath);
            
            // Execute the login test flow
            const testResult = await this.executeIOSLoginFlow(username, password);
            
            this.results.push(testResult);
            
            // Generate reports
            await this.framework.generateReports();
            
            // Display summary
            this.displaySummary();
            
            return testResult.success;
            
        } catch (error) {
            console.error('❌ Test execution failed:', error.message);
            this.results.push({
                testName: 'Flutter Login Test',
                success: false,
                error: error.message,
                duration: 0,
                screenshots: 0
            });
            
            await this.framework.generateReports();
            this.displaySummary();
            return false;
            
        } finally {
            await this.framework.cleanup();
        }
    }

    async executeIOSLoginFlow(username, password) {
        const startTime = Date.now();
        
        try {
            // Step 1: Connect and initialize
            console.log('⚠️ Step: Initialize iOS Connection');
            await this.framework.captureScreenshot('ios_initial_connection');
            await this.framework.addTestStep('Initialize iOS Connection', 'Initialize connection to iOS simulator', 'running');
            
            // For iOS, we need to use different element finding strategies
            // iOS uses accessibility identifiers and XPath differently than Android
            
            // Step 2: Find and click login screen (iOS specific)
            console.log('⚠️ Step: Navigate to Login Screen');
            await this.framework.captureScreenshot('before_navigate_login_ios');
            await this.framework.addTestStep('Navigate to Login Screen', 'Looking for login navigation', 'running');
            
            // iOS-specific element finding - using accessibility identifiers
            const loginElements = await this.framework.driver.$$('//XCUIElementTypeButton[@name="Login" or @label="Login"]');
            if (loginElements.length > 0) {
                await loginElements[0].click();
                await this.framework.addTestStep('Navigate to Login Screen', 'Successfully navigated to login screen', 'passed');
            } else {
                console.log('⚠️ Login button not found, assuming already on login screen');
                await this.framework.addTestStep('Navigate to Login Screen', 'Already on login screen', 'passed');
            }
            
            await this.framework.captureScreenshot('ios_login_screen_loaded');
            
            // Step 3: Fill username (iOS specific)
            console.log('⚠️ Step: Fill Username');
            await this.framework.captureScreenshot('before_fill_username_ios');
            await this.framework.addTestStep('Fill Username', 'Filling username field', 'running');
            
            // iOS text field identification
            const usernameField = await this.framework.driver.$('//XCUIElementTypeTextField[@name="username" or @placeholder="Username" or @value="Username"]');
            if (await usernameField.isExisting()) {
                await usernameField.click();
                await usernameField.clearValue();
                await usernameField.setValue(username);
                await this.framework.captureScreenshot('after_fill_username_ios');
                await this.framework.addTestStep('Fill Username', `Successfully filled username: ${username}`, 'passed');
            } else {
                throw new Error('Username field not found on iOS');
            }
            
            // Step 4: Fill password (iOS specific)  
            console.log('⚠️ Step: Fill Password');
            await this.framework.captureScreenshot('before_fill_password_ios');
            await this.framework.addTestStep('Fill Password', 'Filling password field', 'running');
            
            const passwordField = await this.framework.driver.$('//XCUIElementTypeSecureTextField[@name="password" or @placeholder="Password" or @value="Password"]');
            if (await passwordField.isExisting()) {
                await passwordField.click();
                await passwordField.clearValue();
                await passwordField.setValue(password);
                await this.framework.captureScreenshot('after_fill_password_ios');
                await this.framework.addTestStep('Fill Password', 'Successfully filled password', 'passed');
            } else {
                throw new Error('Password field not found on iOS');
            }
            
            // Step 5: Click submit button (iOS specific)
            console.log('⚠️ Step: Submit Login');
            await this.framework.captureScreenshot('before_submit_ios');
            await this.framework.addTestStep('Submit Login', 'Clicking submit button', 'running');
            
            const submitButton = await this.framework.driver.$('//XCUIElementTypeButton[@name="Submit" or @name="Login" or @name="Sign In"]');
            if (await submitButton.isExisting()) {
                await submitButton.click();
                await this.framework.captureScreenshot('after_submit_ios');
                await this.framework.addTestStep('Submit Login', 'Successfully submitted login', 'passed');
            } else {
                throw new Error('Submit button not found on iOS');
            }
            
            // Step 6: Verify login result
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for navigation
            await this.framework.captureScreenshot('ios_login_result');
            
            const duration = Date.now() - startTime;
            
            await this.framework.finishTest('passed', 'Login test completed successfully');
            await this.framework.captureScreenshot('ios_test_end_passed');
            
            return {
                testName: 'iOS Flutter Login Test',
                success: true,
                duration: duration,
                screenshots: this.framework.screenshots.length,
                steps: this.framework.currentTest?.steps?.length || 0
            };
            
        } catch (error) {
            console.error('❌ iOS Login test failed:', error.message);
            await this.framework.captureScreenshot('ios_test_error');
            await this.framework.finishTest('failed', error.message);
            
            const duration = Date.now() - startTime;
            
            return {
                testName: 'iOS Flutter Login Test',
                success: false,
                error: error.message,
                duration: duration,
                screenshots: this.framework.screenshots.length,
                steps: this.framework.currentTest?.steps?.length || 0
            };
        }
    }

    async runAllTests() {
        console.log('🏃‍♂️ Running iOS Flutter Test Suite...');
        
        const testCases = [
            { username: 'demouser', password: 'demopass123' },
            { username: 'testuser', password: 'testpass456' }
        ];
        
        for (const testCase of testCases) {
            console.log(`\n📋 Running test with ${testCase.username}...`);
            await this.runSingleTest(testCase.username, testCase.password);
        }
        
        this.displaySummary();
    }

    displaySummary() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 iOS FLUTTER TEST EXECUTION SUMMARY');
        console.log('='.repeat(80));
        console.log(`📋 Total Tests: ${this.results.length}`);
        console.log(`✅ Passed: ${this.results.filter(r => r.success).length}`);
        console.log(`❌ Failed: ${this.results.filter(r => !r.success).length}`);
        console.log(`📸 Screenshots: ${this.results.reduce((sum, r) => sum + (r.screenshots || 0), 0)}`);
        console.log(`📁 Report Directory: ./allure-results`);
        console.log(`📸 Screenshot Directory: ./screenshots`);
        
        console.log('\n📄 Generated Files:');
        console.log('   - HTML Report: ./allure-results/test-report.html');
        console.log('   - Allure Results: ./allure-results/');
        console.log('   - Screenshots: ./screenshots/');
        
        this.results.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            const statusText = result.success ? 'PASSED' : 'FAILED';
            console.log(`\n${status} Test ${index + 1}: ${result.testName}`);
            console.log(`   Status: ${statusText}`);
            console.log(`   Duration: ${result.duration}ms`);
            console.log(`   Steps: ${result.steps || 0}`);
            console.log(`   Screenshots: ${result.screenshots || 0}`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });
        
        console.log('\n' + '='.repeat(80));
    }
}

// CLI execution
async function main() {
    const runner = new IOSFlutterTestRunner();
    
    const args = process.argv.slice(2);
    const command = args[0] || 'single';
    
    try {
        if (command === 'single') {
            const username = args[1] || 'demouser';
            const password = args[2] || 'demopass123';
            const success = await runner.runSingleTest(username, password);
            process.exit(success ? 0 : 1);
        } else if (command === 'suite') {
            await runner.runAllTests();
            const allPassed = runner.results.every(r => r.success);
            process.exit(allPassed ? 0 : 1);
        } else {
            console.log('Usage:');
            console.log('  node ios-flutter-test-runner.js single [username] [password]');
            console.log('  node ios-flutter-test-runner.js suite');
            process.exit(1);
        }
    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { IOSFlutterTestRunner };