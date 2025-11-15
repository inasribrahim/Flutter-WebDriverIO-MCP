const { remote } = require('webdriverio');
const fs = require('fs-extra');
const path = require('path');

class AllureFlutterTestFramework {
    constructor() {
        this.driver = null;
        this.currentTest = null;
        this.testResults = [];
        this.screenshots = [];
        this.reportDir = './allure-results';
        this.screenshotDir = './screenshots';
        
        // Initialize directories
        this.initializeDirectories();
    }

    initializeDirectories() {
        // Create directories if they don't exist
        fs.ensureDirSync(this.reportDir);
        fs.ensureDirSync(this.screenshotDir);
        
        console.log(`📁 Report directory: ${this.reportDir}`);
        console.log(`📸 Screenshot directory: ${this.screenshotDir}`);
    }



    async connect() {
        console.log('🔗 Connecting to Appium server...');
        
        const capabilities = require('./flutter-capabilities.json');
        
        try {
            this.driver = await remote({
                hostname: 'localhost',
                port: 4723,
                capabilities: capabilities
            });
            
            console.log('✅ Connected to Appium server successfully');
            console.log(`📱 Session ID: ${this.driver.sessionId}`);
            
            // Take initial screenshot
            await this.captureScreenshot('initial_connection');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to Appium:', error.message);
            return false;
        }
    }

    async captureScreenshot(name, attachToTest = true) {
        try {
            const screenshot = await this.driver.takeScreenshot();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${name}_${timestamp}.png`;
            const filepath = path.join(this.screenshotDir, filename);
            
            // Save screenshot to file
            await fs.writeFile(filepath, screenshot, 'base64');
            
            const screenshotInfo = {
                name: name,
                filename: filename,
                filepath: filepath,
                timestamp: new Date().toISOString(),
                size: Buffer.from(screenshot, 'base64').length
            };
            
            this.screenshots.push(screenshotInfo);
            
            console.log(`📸 Screenshot captured: ${filename} (${Math.round(screenshotInfo.size / 1024)}KB)`);
            
            // Attach to current test if available
            if (attachToTest && this.currentTest) {
                this.attachScreenshotToTest(screenshotInfo);
            }
            
            return screenshotInfo;
        } catch (error) {
            console.error('❌ Error capturing screenshot:', error.message);
            return null;
        }
    }

    attachScreenshotToTest(screenshotInfo) {
        try {
            // Add screenshot as attachment to current test
            if (this.currentTest) {
                this.currentTest.attachments = this.currentTest.attachments || [];
                this.currentTest.attachments.push({
                    name: screenshotInfo.name,
                    type: 'image/png',
                    source: screenshotInfo.filepath
                });
            }
        } catch (error) {
            console.error('❌ Error attaching screenshot to test:', error.message);
        }
    }

    startTest(testName, description = '') {
        const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        this.currentTest = {
            id: testId,
            name: testName,
            description: description,
            startTime: new Date().toISOString(),
            status: 'running',
            steps: [],
            attachments: [],
            parameters: []
        };
        
        console.log(`\n🧪 Starting test: ${testName}`);
        console.log(`📝 Description: ${description}`);
        console.log(`🆔 Test ID: ${testId}`);
        
        return testId;
    }

    addTestStep(stepName, status = 'passed', details = '') {
        if (!this.currentTest) {
            console.warn('⚠️ No active test to add step to');
            return;
        }
        
        const step = {
            name: stepName,
            status: status,
            startTime: new Date().toISOString(),
            details: details
        };
        
        this.currentTest.steps.push(step);
        
        const statusIcon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
        console.log(`${statusIcon} Step: ${stepName}`);
        if (details) console.log(`   Details: ${details}`);
    }

    addTestParameter(name, value) {
        if (!this.currentTest) {
            console.warn('⚠️ No active test to add parameter to');
            return;
        }
        
        this.currentTest.parameters.push({
            name: name,
            value: value
        });
        
        console.log(`📊 Parameter: ${name} = ${value}`);
    }

    async finishTest(status = 'passed', errorMessage = '') {
        if (!this.currentTest) {
            console.warn('⚠️ No active test to finish');
            return;
        }
        
        this.currentTest.endTime = new Date().toISOString();
        this.currentTest.status = status;
        this.currentTest.duration = new Date(this.currentTest.endTime) - new Date(this.currentTest.startTime);
        
        if (errorMessage) {
            this.currentTest.errorMessage = errorMessage;
        }
        
        // Take final screenshot
        await this.captureScreenshot(`test_end_${status}`);
        
        // Save test result
        this.testResults.push({ ...this.currentTest });
        
        const statusIcon = status === 'passed' ? '✅' : '❌';
        console.log(`${statusIcon} Test finished: ${this.currentTest.name} - ${status.toUpperCase()}`);
        console.log(`⏱️ Duration: ${this.currentTest.duration}ms`);
        
        // Reset current test
        this.currentTest = null;
    }

    async switchToNativeContext() {
        this.addTestStep('Switch to Native Context', 'running');
        
        try {
            const contexts = await this.driver.getContexts();
            console.log('📱 Available contexts:', contexts);
            
            if (contexts.includes('NATIVE_APP')) {
                await this.driver.switchContext('NATIVE_APP');
                this.addTestStep('Switch to Native Context', 'passed', `Switched from ${contexts.join(', ')} to NATIVE_APP`);
                return true;
            } else {
                this.addTestStep('Switch to Native Context', 'failed', 'NATIVE_APP context not available');
                return false;
            }
        } catch (error) {
            this.addTestStep('Switch to Native Context', 'failed', error.message);
            throw error;
        }
    }

    async clickElement(elementDescription, selector) {
        this.addTestStep(`Click ${elementDescription}`, 'running');
        
        try {
            await this.captureScreenshot(`before_click_${elementDescription.replace(/\s+/g, '_')}`);
            
            // Implementation depends on how you want to find the element
            // This is a placeholder - you'll need to adapt based on your element finding strategy
            const elements = await this.driver.$$('*');
            let targetElement = null;
            
            // Find element by content description
            for (let element of elements) {
                try {
                    const contentDesc = await element.getAttribute('content-desc');
                    if (contentDesc && contentDesc.includes(selector)) {
                        targetElement = element;
                        break;
                    }
                } catch (e) {
                    // Skip elements that can't be analyzed
                }
            }
            
            if (targetElement) {
                await targetElement.click();
                await this.captureScreenshot(`after_click_${elementDescription.replace(/\s+/g, '_')}`);
                this.addTestStep(`Click ${elementDescription}`, 'passed', `Successfully clicked element with selector: ${selector}`);
                return true;
            } else {
                this.addTestStep(`Click ${elementDescription}`, 'failed', `Element not found with selector: ${selector}`);
                return false;
            }
        } catch (error) {
            await this.captureScreenshot(`error_click_${elementDescription.replace(/\s+/g, '_')}`);
            this.addTestStep(`Click ${elementDescription}`, 'failed', error.message);
            throw error;
        }
    }

    async fillField(fieldDescription, value, elementClass = 'android.widget.EditText') {
        this.addTestStep(`Fill ${fieldDescription}`, 'running');
        
        try {
            await this.captureScreenshot(`before_fill_${fieldDescription.replace(/\s+/g, '_')}`);
            
            const elements = await this.driver.$$('*');
            let targetElement = null;
            
            // Find input field
            for (let element of elements) {
                try {
                    const className = await element.getAttribute('class');
                    const text = await element.getText();
                    
                    if (className === elementClass && text && text.toLowerCase().includes(fieldDescription.toLowerCase())) {
                        targetElement = element;
                        break;
                    }
                } catch (e) {
                    // Skip elements that can't be analyzed
                }
            }
            
            if (targetElement) {
                await targetElement.click();
                await this.driver.pause(500);
                await targetElement.setValue(value);
                await this.captureScreenshot(`after_fill_${fieldDescription.replace(/\s+/g, '_')}`);
                
                // Mask sensitive data in logs
                const displayValue = fieldDescription.toLowerCase().includes('password') ? '*'.repeat(value.length) : value;
                this.addTestStep(`Fill ${fieldDescription}`, 'passed', `Successfully filled field with: ${displayValue}`);
                return true;
            } else {
                this.addTestStep(`Fill ${fieldDescription}`, 'failed', `Field not found: ${fieldDescription}`);
                return false;
            }
        } catch (error) {
            await this.captureScreenshot(`error_fill_${fieldDescription.replace(/\s+/g, '_')}`);
            this.addTestStep(`Fill ${fieldDescription}`, 'failed', error.message);
            throw error;
        }
    }

    async generateAllureReport() {
        console.log('\n📊 Generating Allure report...');
        
        try {
            // Create Allure result files
            for (const testResult of this.testResults) {
                const allureTestResult = {
                    uuid: testResult.id,
                    name: testResult.name,
                    description: testResult.description,
                    start: new Date(testResult.startTime).getTime(),
                    stop: new Date(testResult.endTime).getTime(),
                    status: testResult.status === 'passed' ? 'passed' : 'failed',
                    steps: testResult.steps.map(step => ({
                        name: step.name,
                        status: step.status === 'passed' ? 'passed' : 'failed',
                        start: new Date(step.startTime).getTime(),
                        stop: new Date(step.startTime).getTime() + 1000 // Placeholder duration
                    })),
                    attachments: testResult.attachments || [],
                    parameters: testResult.parameters || []
                };
                
                if (testResult.errorMessage) {
                    allureTestResult.statusDetails = {
                        message: testResult.errorMessage
                    };
                }
                
                // Write test result file
                const resultFileName = `${testResult.id}-result.json`;
                const resultFilePath = path.join(this.reportDir, resultFileName);
                await fs.writeJSON(resultFilePath, allureTestResult, { spaces: 2 });
            }
            
            // Generate environment properties
            const envProps = {
                'Platform': 'Android',
                'Device': 'Emulator',
                'App': 'Flutter Test App',
                'Automation': 'Appium + WebDriverIO',
                'Test Framework': 'Custom Allure Framework',
                'Date': new Date().toISOString()
            };
            
            const envPropsContent = Object.entries(envProps)
                .map(([key, value]) => `${key}=${value}`)
                .join('\n');
            
            await fs.writeFile(path.join(this.reportDir, 'environment.properties'), envPropsContent);
            
            // Create summary
            const summary = {
                totalTests: this.testResults.length,
                passed: this.testResults.filter(t => t.status === 'passed').length,
                failed: this.testResults.filter(t => t.status === 'failed').length,
                screenshots: this.screenshots.length,
                reportDir: this.reportDir,
                screenshotDir: this.screenshotDir
            };
            
            console.log('📊 Test Summary:');
            console.log(`   Total Tests: ${summary.totalTests}`);
            console.log(`   Passed: ${summary.passed}`);
            console.log(`   Failed: ${summary.failed}`);
            console.log(`   Screenshots: ${summary.screenshots}`);
            console.log(`   Report Directory: ${summary.reportDir}`);
            
            return summary;
            
        } catch (error) {
            console.error('❌ Error generating Allure report:', error.message);
            throw error;
        }
    }

    async runLoginTest(username = 'testuser', password = 'testpass') {
        const testId = this.startTest('Flutter Login Test', 'Automated login test with screenshot capture');
        
        this.addTestParameter('Username', username);
        this.addTestParameter('Password', '*'.repeat(password.length));
        
        try {
            // Step 1: Connect
            this.addTestStep('Connect to App', 'running');
            const connected = await this.connect();
            if (!connected) {
                this.addTestStep('Connect to App', 'failed', 'Could not connect to Appium server');
                await this.finishTest('failed', 'Connection failed');
                return false;
            }
            this.addTestStep('Connect to App', 'passed', 'Successfully connected to Appium');
            
            // Step 2: Switch context
            await this.switchToNativeContext();
            
            // Step 3: Click Login Screen
            const loginClicked = await this.clickElement('Login Screen', 'Login Screen');
            if (!loginClicked) {
                await this.finishTest('failed', 'Could not click Login Screen');
                return false;
            }
            
            // Wait for login screen to load
            await this.driver.pause(2000);
            await this.captureScreenshot('login_screen_loaded');
            
            // Step 4: Fill username
            const usernameFilled = await this.fillField('username', username);
            if (!usernameFilled) {
                await this.finishTest('failed', 'Could not fill username field');
                return false;
            }
            
            // Step 5: Fill password
            const passwordFilled = await this.fillField('password', password);
            if (!passwordFilled) {
                await this.finishTest('failed', 'Could not fill password field');
                return false;
            }
            
            // Step 6: Click Submit
            const submitClicked = await this.clickElement('Submit Button', 'Submit');
            if (!submitClicked) {
                await this.finishTest('failed', 'Could not click submit button');
                return false;
            }
            
            // Wait for result
            await this.driver.pause(2000);
            await this.captureScreenshot('login_result');
            
            await this.finishTest('passed');
            return true;
            
        } catch (error) {
            console.error('❌ Test failed with error:', error.message);
            await this.captureScreenshot('test_error');
            await this.finishTest('failed', error.message);
            return false;
        }
    }

    async cleanup() {
        if (this.driver) {
            try {
                await this.captureScreenshot('final_cleanup');
                await this.driver.deleteSession();
                console.log('🧹 Session cleaned up');
            } catch (error) {
                console.log('⚠️ Error cleaning up session:', error.message);
            }
        }
    }

    async generateHTMLReport() {
        console.log('\n📄 Generating HTML report...');
        
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flutter Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { display: flex; justify-content: space-around; margin-bottom: 30px; }
        .summary-item { text-align: center; padding: 15px; border-radius: 8px; background-color: #f9f9f9; }
        .passed { color: #4CAF50; }
        .failed { color: #f44336; }
        .test-result { margin-bottom: 30px; border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
        .test-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .steps { margin-left: 20px; }
        .step { margin-bottom: 10px; padding: 8px; border-left: 3px solid #ddd; padding-left: 15px; }
        .step.passed { border-left-color: #4CAF50; background-color: #f1f8e9; }
        .step.failed { border-left-color: #f44336; background-color: #ffebee; }
        .screenshots { margin-top: 15px; }
        .screenshot { display: inline-block; margin: 5px; }
        .screenshot img { width: 200px; height: auto; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; }
        .screenshot img:hover { opacity: 0.8; }
        .parameters { background-color: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Flutter Automation Test Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-item">
                <h3>Total Tests</h3>
                <div style="font-size: 24px; font-weight: bold;">${this.testResults.length}</div>
            </div>
            <div class="summary-item">
                <h3>Passed</h3>
                <div style="font-size: 24px; font-weight: bold;" class="passed">${this.testResults.filter(t => t.status === 'passed').length}</div>
            </div>
            <div class="summary-item">
                <h3>Failed</h3>
                <div style="font-size: 24px; font-weight: bold;" class="failed">${this.testResults.filter(t => t.status === 'failed').length}</div>
            </div>
            <div class="summary-item">
                <h3>Screenshots</h3>
                <div style="font-size: 24px; font-weight: bold;">${this.screenshots.length}</div>
            </div>
        </div>
        
        ${this.testResults.map(test => `
            <div class="test-result">
                <div class="test-header">
                    <h2>${test.name}</h2>
                    <span class="${test.status} status" style="font-weight: bold; text-transform: uppercase;">${test.status}</span>
                </div>
                
                <p><strong>Description:</strong> ${test.description}</p>
                <p><strong>Duration:</strong> ${test.duration}ms</p>
                <p><strong>Start Time:</strong> ${new Date(test.startTime).toLocaleString()}</p>
                
                ${test.parameters && test.parameters.length > 0 ? `
                    <div class="parameters">
                        <strong>Parameters:</strong>
                        ${test.parameters.map(param => `<span>${param.name}: ${param.value}</span>`).join(', ')}
                    </div>
                ` : ''}
                
                <div class="steps">
                    <h3>Test Steps:</h3>
                    ${test.steps.map(step => `
                        <div class="step ${step.status}">
                            <strong>${step.name}</strong> - ${step.status}
                            ${step.details ? `<br><small>${step.details}</small>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                ${test.errorMessage ? `<div style="color: #f44336; margin-top: 15px;"><strong>Error:</strong> ${test.errorMessage}</div>` : ''}
            </div>
        `).join('')}
        
        <div class="screenshots">
            <h2>All Screenshots</h2>
            ${this.screenshots.map(screenshot => `
                <div class="screenshot">
                    <img src="../${screenshot.filepath.replace(/\\/g, '/')}" alt="${screenshot.name}" title="${screenshot.name} - ${screenshot.timestamp}">
                    <div style="text-align: center; font-size: 12px; margin-top: 5px;">${screenshot.name}</div>
                </div>
            `).join('')}
        </div>
    </div>
    
    <script>
        // Click to enlarge screenshots
        document.querySelectorAll('.screenshot img').forEach(img => {
            img.addEventListener('click', function() {
                window.open(this.src, '_blank');
            });
        });
    </script>
</body>
</html>`;
        
        const htmlPath = path.join(this.reportDir, 'test-report.html');
        await fs.writeFile(htmlPath, htmlContent);
        
        console.log(`📄 HTML report generated: ${htmlPath}`);
        return htmlPath;
    }
}

module.exports = AllureFlutterTestFramework;