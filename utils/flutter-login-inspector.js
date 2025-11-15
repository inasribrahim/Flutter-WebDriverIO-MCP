// MCP-Appium Flutter App Inspector - Login Screen Locators
const { remote } = require('webdriverio');

/**
 * MCP-compatible Flutter App Inspector
 * Uses the configured MCP-Appium environment to inspect login screen elements
 */
async function inspectFlutterLoginScreen() {
    console.log('🔍 Starting MCP-Appium Flutter App Inspector for Login Screen...');
    console.log('📱 Using MCP configuration from .vscode/mcp.json');
    
    // Use MCP environment variables and capabilities
    const capabilities = {
        'appium:platformName': 'Android',
        'appium:platformVersion': '14.0',
        'appium:deviceName': process.env.DEVICE_NAME || 'Medium_Phone_API_36',
        'appium:automationName': 'Flutter',
        'appium:appPackage': 'com.example.the_app_flutter',
        'appium:appActivity': 'io.flutter.embedding.android.FlutterActivity',
        'appium:newCommandTimeout': 300,
        'appium:flutterSystemPort': parseInt(process.env.FLUTTER_SYSTEM_PORT) || 9999,
        'appium:flutterEnableObservatory': true,
        'appium:noReset': true,
        'appium:fullReset': false,
        // Use MCP environment
        'appium:androidHome': process.env.ANDROID_HOME,
        'appium:androidSdkRoot': process.env.ANDROID_SDK_ROOT
    };
    
    let driver;
    
    try {
        // Connect to Appium server
        driver = await remote({
            protocol: 'http',
            hostname: 'localhost',
            port: 4723,
            path: '/',
            capabilities: capabilities
        });
        
        console.log('✅ Connected to Flutter app');
        
        // Wait for app to load
        await driver.pause(3000);
        
        // Take initial screenshot
        const screenshot = await driver.takeScreenshot();
        console.log('📸 Initial screenshot taken');
        
        console.log('\n🔍 Inspecting Login Screen Elements...');
        
        // Get page source for analysis
        const pageSource = await driver.getPageSource();
        console.log('📱 Page source retrieved');
        
        // Try to find common login elements using different strategies
        const loginElements = [];
        
        // Common Flutter login screen element patterns
        const elementPatterns = [
            // Text fields
            { type: 'TextField', pattern: 'email|username|user', description: 'Email/Username field' },
            { type: 'TextField', pattern: 'password|pass', description: 'Password field' },
            
            // Buttons
            { type: 'ElevatedButton', pattern: 'login|sign.?in|submit', description: 'Login button' },
            { type: 'TextButton', pattern: 'forgot|reset', description: 'Forgot password link' },
            { type: 'TextButton', pattern: 'register|sign.?up|create', description: 'Register/Sign up link' },
            
            // Text widgets
            { type: 'Text', pattern: 'welcome|login|sign.?in', description: 'Welcome/Title text' },
            
            // Form elements
            { type: 'Form', pattern: '.*', description: 'Login form' },
            { type: 'Column', pattern: '.*', description: 'Layout container' }
        ];
        
        // Try Flutter-specific element finding
        try {
            console.log('\n🐦 Attempting Flutter widget detection...');
            
            // Look for text fields (common in login screens)
            try {
                const textFields = await driver.$$('flutter:TextField');
                console.log(`📝 Found ${textFields.length} TextField widgets`);
                
                for (let i = 0; i < textFields.length; i++) {
                    try {
                        const element = textFields[i];
                        const text = await element.getText();
                        const isDisplayed = await element.isDisplayed();
                        console.log(`   TextField ${i + 1}: "${text}" (visible: ${isDisplayed})`);
                        loginElements.push({
                            type: 'TextField',
                            index: i + 1,
                            text: text,
                            locator: `flutter:TextField[${i}]`,
                            visible: isDisplayed
                        });
                    } catch (e) {
                        console.log(`   TextField ${i + 1}: Unable to get details`);
                    }
                }
            } catch (e) {
                console.log('   No TextField widgets found with Flutter driver');
            }
            
            // Look for buttons
            try {
                const buttons = await driver.$$('flutter:ElevatedButton');
                console.log(`🔘 Found ${buttons.length} ElevatedButton widgets`);
                
                for (let i = 0; i < buttons.length; i++) {
                    try {
                        const element = buttons[i];
                        const text = await element.getText();
                        const isDisplayed = await element.isDisplayed();
                        console.log(`   Button ${i + 1}: "${text}" (visible: ${isDisplayed})`);
                        loginElements.push({
                            type: 'ElevatedButton',
                            index: i + 1,
                            text: text,
                            locator: `flutter:ElevatedButton[${i}]`,
                            visible: isDisplayed
                        });
                    } catch (e) {
                        console.log(`   Button ${i + 1}: Unable to get details`);
                    }
                }
            } catch (e) {
                console.log('   No ElevatedButton widgets found');
            }
            
            // Look for text widgets
            try {
                const textWidgets = await driver.$$('flutter:Text');
                console.log(`📄 Found ${textWidgets.length} Text widgets`);
                
                // Limit to first 10 text widgets to avoid spam
                const maxTexts = Math.min(10, textWidgets.length);
                for (let i = 0; i < maxTexts; i++) {
                    try {
                        const element = textWidgets[i];
                        const text = await element.getText();
                        const isDisplayed = await element.isDisplayed();
                        if (text && text.trim().length > 0) {
                            console.log(`   Text ${i + 1}: "${text}" (visible: ${isDisplayed})`);
                            loginElements.push({
                                type: 'Text',
                                index: i + 1,
                                text: text,
                                locator: `flutter:Text[${i}]`,
                                visible: isDisplayed
                            });
                        }
                    } catch (e) {
                        // Skip problematic elements
                    }
                }
            } catch (e) {
                console.log('   No Text widgets found');
            }
            
        } catch (error) {
            console.log('⚠️  Flutter driver detection failed, trying UiAutomator2 fallback...');
            
            // Fallback to UiAutomator2 if Flutter driver fails
            const contexts = await driver.getContexts();
            console.log('📱 Available contexts:', contexts);
            
            // Try to switch to native context
            if (contexts.includes('NATIVE_APP')) {
                await driver.switchContext('NATIVE_APP');
                console.log('🔄 Switched to NATIVE_APP context');
                
                // Look for common Android elements
                try {
                    const editTexts = await driver.$$('//android.widget.EditText');
                    console.log(`📝 Found ${editTexts.length} EditText elements`);
                    
                    for (let i = 0; i < editTexts.length; i++) {
                        try {
                            const element = editTexts[i];
                            const text = await element.getText();
                            const hint = await element.getAttribute('hint');
                            console.log(`   EditText ${i + 1}: text="${text}", hint="${hint}"`);
                        } catch (e) {
                            console.log(`   EditText ${i + 1}: Unable to get details`);
                        }
                    }
                } catch (e) {
                    console.log('   No EditText elements found');
                }
            }
        }
        
        // Generate MCP-compatible locator recommendations
        console.log('\n📋 MCP-Appium Login Screen Locator Summary:');
        console.log('==========================================');
        
        const mcpLocators = {
            textFields: [],
            buttons: [],
            textElements: [],
            mcpCommands: []
        };
        
        if (loginElements.length > 0) {
            loginElements.forEach((element, index) => {
                console.log(`${index + 1}. ${element.type}: "${element.text}"`);
                console.log(`   Locator: ${element.locator}`);
                console.log(`   Visible: ${element.visible}`);
                console.log('');
                
                // Categorize for MCP usage
                if (element.type === 'TextField') {
                    mcpLocators.textFields.push({
                        name: element.text || `textField_${element.index}`,
                        locator: element.locator,
                        mcpAction: `driver.$(${element.locator}).setValue('your_text')`
                    });
                } else if (element.type.includes('Button')) {
                    mcpLocators.buttons.push({
                        name: element.text || `button_${element.index}`,
                        locator: element.locator,
                        mcpAction: `driver.$(${element.locator}).click()`
                    });
                } else if (element.type === 'Text') {
                    mcpLocators.textElements.push({
                        name: element.text || `text_${element.index}`,
                        locator: element.locator,
                        mcpAction: `driver.$(${element.locator}).getText()`
                    });
                }
            });
            
            // Generate MCP command suggestions
            console.log('\n🤖 MCP-Appium Command Suggestions:');
            console.log('===================================');
            
            if (mcpLocators.textFields.length > 0) {
                console.log('📝 Text Field Interactions:');
                mcpLocators.textFields.forEach(field => {
                    console.log(`   // ${field.name}`);
                    console.log(`   await ${field.mcpAction};`);
                });
                console.log('');
            }
            
            if (mcpLocators.buttons.length > 0) {
                console.log('🔘 Button Interactions:');
                mcpLocators.buttons.forEach(button => {
                    console.log(`   // ${button.name}`);
                    console.log(`   await ${button.mcpAction};`);
                });
                console.log('');
            }
            
            // Generate complete MCP test scenario
            console.log('🎭 Complete MCP Login Test Scenario:');
            console.log('====================================');
            console.log('// Example MCP-Appium login test');
            mcpLocators.textFields.forEach((field, index) => {
                if (field.name.toLowerCase().includes('email') || field.name.toLowerCase().includes('username')) {
                    console.log(`await ${field.mcpAction.replace('your_text', 'test@example.com')};`);
                } else if (field.name.toLowerCase().includes('password')) {
                    console.log(`await ${field.mcpAction.replace('your_text', 'password123')};`);
                }
            });
            mcpLocators.buttons.forEach(button => {
                if (button.name.toLowerCase().includes('login') || button.name.toLowerCase().includes('sign')) {
                    console.log(`await ${button.mcpAction};`);
                }
            });
            
        } else {
            console.log('No specific login elements detected.');
            console.log('MCP-Appium Generic Flutter Locators:');
            console.log('- flutter:TextField (for input fields)');
            console.log('- flutter:ElevatedButton (for buttons)');
            console.log('- flutter:Text (for text elements)');
            console.log('- flutter:key=your_key (for keyed widgets)');
        }
        
        // Save structured data for MCP usage
        const mcpData = {
            timestamp: new Date().toISOString(),
            appPackage: 'com.example.the_app_flutter',
            capabilities: capabilities,
            locators: mcpLocators,
            pageSource: pageSource
        };
        
        require('fs').writeFileSync('mcp_login_locators.json', JSON.stringify(mcpData, null, 2));
        console.log('💾 MCP locator data saved to mcp_login_locators.json');
        
        require('fs').writeFileSync('login_screen_source.xml', pageSource);
        console.log('💾 Page source saved to login_screen_source.xml');
        
        console.log('\n✅ MCP-Appium login screen inspection completed!');
        
    } catch (error) {
        console.error('❌ Inspection failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Make sure Appium server is running (appium)');
        console.log('2. Ensure Flutter app is installed and launching');
        console.log('3. Check that Flutter driver is properly configured');
        console.log('4. Verify emulator is running and accessible');
    } finally {
        if (driver) {
            await driver.deleteSession();
            console.log('🏁 Inspection session ended');
        }
    }
}

// Export for use
module.exports = { inspectFlutterLoginScreen };

// Run directly if called
if (require.main === module) {
    inspectFlutterLoginScreen();
}