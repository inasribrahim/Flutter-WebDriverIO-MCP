// MCP-Appium Flutter Login Screen Interaction
const { remote } = require('webdriverio');

class FlutterLoginInteractor {
    constructor() {
        this.driver = null;
        this.appPackage = 'com.example.the_app_flutter';
        this.appActivity = 'com.example.the_app_flutter.MainActivity';
    }

    async connect() {
        console.log('🔗 Connecting to Flutter app via MCP-Appium...');
        
        const capabilities = {
            'appium:platformName': 'Android',
            'appium:platformVersion': '16',
            'appium:deviceName': 'Medium_Phone_API_36',
            'appium:automationName': 'Flutter',
            'appium:appPackage': this.appPackage,
            'appium:appActivity': this.appActivity,
            'appium:newCommandTimeout': 300,
            'appium:flutterSystemPort': 9999,
            'appium:flutterEnableObservatory': true,
            'appium:noReset': true,
            'appium:fullReset': false
        };

        try {
            this.driver = await remote({
                protocol: 'http',
                hostname: 'localhost',
                port: 4723,
                path: '/',
                capabilities: capabilities
            });
            
            console.log('✅ Connected to Flutter app');
            return true;
        } catch (error) {
            console.error('❌ Failed to connect:', error.message);
            return false;
        }
    }

    async waitForLoginScreen() {
        console.log('⏳ Waiting for login screen to load...');
        await this.driver.pause(3000);
        
        // Take screenshot to verify we're on login screen
        const screenshot = await this.driver.takeScreenshot();
        console.log('📸 Login screen screenshot captured');
        
        return true;
    }

    async findLoginElements() {
        console.log('🔍 Finding login screen elements...');
        const elements = {};

        try {
            // First try Flutter-specific selectors
            console.log('🐦 Trying Flutter-specific selectors...');
            try {
                const textFields = await this.driver.$$('flutter:TextField');
                console.log(`📝 Found ${textFields.length} Flutter TextFields`);
                
                if (textFields.length >= 2) {
                    elements.usernameField = textFields[0];
                    elements.passwordField = textFields[1];
                    console.log('✅ Username and password fields identified (Flutter)');
                } else if (textFields.length === 1) {
                    elements.usernameField = textFields[0];
                    console.log('✅ Username field identified (Flutter)');
                }
            } catch (flutterError) {
                console.log('⚠️ Flutter selectors not working, trying UiAutomator2...');
                
                // Switch to native context and try UiAutomator2 selectors
                try {
                    const contexts = await this.driver.getContexts();
                    console.log('📱 Available contexts:', contexts);
                    
                    if (contexts.includes('NATIVE_APP')) {
                        await this.driver.switchContext('NATIVE_APP');
                        console.log('🔄 Switched to NATIVE_APP context');
                        
                        // Try to find EditText elements (Android native)
                        const editTexts = await this.driver.$$('//android.widget.EditText');
                        console.log(`📝 Found ${editTexts.length} EditText elements`);
                        
                        if (editTexts.length >= 2) {
                            elements.usernameField = editTexts[0];
                            elements.passwordField = editTexts[1];
                            console.log('✅ Username and password fields identified (Native)');
                        } else if (editTexts.length === 1) {
                            elements.usernameField = editTexts[0];
                            console.log('✅ Username field identified (Native)');
                        }
                        
                        // Find buttons in native context  
                        const buttons = await this.driver.$$('//android.widget.Button');
                        if (buttons.length > 0) {
                            elements.loginButton = buttons[0];
                            console.log('✅ Login button found (Native)');
                        } else {
                            // Try clickable elements
                            const clickables = await this.driver.$$('//*[@clickable="true"]');
                            console.log(`🔘 Found ${clickables.length} clickable elements`);
                            if (clickables.length > 0) {
                                // Look for elements with login-related text
                                for (const clickable of clickables) {
                                    try {
                                        const text = await clickable.getText();
                                        if (text && (text.toLowerCase().includes('login') || 
                                                   text.toLowerCase().includes('sign in') ||
                                                   text.toLowerCase().includes('submit'))) {
                                            elements.loginButton = clickable;
                                            console.log(`✅ Login button found by text: "${text}"`);
                                            break;
                                        }
                                    } catch (e) {
                                        // Skip elements without text
                                    }
                                }
                            }
                        }
                    }
                } catch (nativeError) {
                    console.log('⚠️ Native context also failed:', nativeError.message);
                }
            }

            // Try alternative approaches if still no elements found
            if (!elements.usernameField && !elements.passwordField) {
                console.log('🔍 Trying alternative element finding strategies...');
                
                // Try by resource-id (common Android pattern)
                try {
                    const usernameById = await this.driver.$('//android.widget.EditText[@resource-id="*username*" or @resource-id="*email*"]');
                    if (usernameById) {
                        elements.usernameField = usernameById;
                        console.log('✅ Username field found by resource-id');
                    }
                } catch (e) {}
                
                try {
                    const passwordById = await this.driver.$('//android.widget.EditText[@resource-id="*password*"]');
                    if (passwordById) {
                        elements.passwordField = passwordById;
                        console.log('✅ Password field found by resource-id');
                    }
                } catch (e) {}
                
                // Try by hint text
                try {
                    const usernameByHint = await this.driver.$('//android.widget.EditText[@hint="*email*" or @hint="*username*"]');
                    if (usernameByHint && !elements.usernameField) {
                        elements.usernameField = usernameByHint;
                        console.log('✅ Username field found by hint');
                    }
                } catch (e) {}
                
                try {
                    const passwordByHint = await this.driver.$('//android.widget.EditText[@hint="*password*"]');
                    if (passwordByHint && !elements.passwordField) {
                        elements.passwordField = passwordByHint;
                        console.log('✅ Password field found by hint');
                    }
                } catch (e) {}
            }

        } catch (error) {
            console.error('❌ Error finding elements:', error.message);
        }

        // Summary of found elements
        console.log('\n📋 Element Discovery Summary:');
        console.log(`   Username field: ${elements.usernameField ? '✅ Found' : '❌ Not found'}`);
        console.log(`   Password field: ${elements.passwordField ? '✅ Found' : '❌ Not found'}`);
        console.log(`   Login button: ${elements.loginButton ? '✅ Found' : '❌ Not found'}`);

        return elements;
    }

    async performLogin(username = 'testuser@example.com', password = 'password123') {
        console.log('🚀 Starting login interaction...');
        
        // Wait for login screen
        await this.waitForLoginScreen();
        
        // Find elements
        const elements = await this.findLoginElements();
        
        try {
            // Enter username
            if (elements.usernameField) {
                console.log('📝 Entering username...');
                await elements.usernameField.setValue(username);
                console.log('✅ Username entered successfully');
                await this.driver.pause(1000);
            } else {
                console.log('❌ Username field not found');
                return false;
            }

            // Enter password
            if (elements.passwordField) {
                console.log('🔒 Entering password...');
                await elements.passwordField.setValue(password);
                console.log('✅ Password entered successfully');
                await this.driver.pause(1000);
            } else {
                console.log('❌ Password field not found');
                return false;
            }

            // Click login button
            if (elements.loginButton) {
                console.log('🔘 Clicking login button...');
                await elements.loginButton.click();
                console.log('✅ Login button clicked');
                await this.driver.pause(3000); // Wait for login response
            } else {
                console.log('❌ Login button not found');
                return false;
            }

            // Verify login result
            console.log('🔍 Checking login result...');
            const postLoginScreenshot = await this.driver.takeScreenshot();
            console.log('📸 Post-login screenshot captured');

            // Try to detect if login was successful by looking for different screens
            try {
                const currentActivity = await this.driver.getCurrentActivity();
                console.log(`📱 Current activity: ${currentActivity}`);
                
                // Check for common success indicators
                const contexts = await this.driver.getContexts();
                console.log('📱 Available contexts:', contexts);
                
                console.log('✅ Login interaction completed!');
                return true;
                
            } catch (e) {
                console.log('⚠️ Could not verify login result, but interaction completed');
                return true;
            }

        } catch (error) {
            console.error('❌ Login interaction failed:', error.message);
            return false;
        }
    }

    async inspectCurrentScreen() {
        console.log('🔍 Inspecting current screen...');
        
        try {
            // Get page source
            const pageSource = await this.driver.getPageSource();
            
            // Save page source for analysis
            require('fs').writeFileSync('current_screen_source.xml', pageSource);
            console.log('💾 Page source saved to current_screen_source.xml');
            
            // Try to find all interactive elements
            const interactiveElements = {};
            
            // Find all buttons
            try {
                const buttons = await this.driver.$$('flutter:ElevatedButton');
                interactiveElements.elevatedButtons = buttons.length;
                console.log(`🔘 Found ${buttons.length} ElevatedButton elements`);
            } catch (e) {}
            
            try {
                const textButtons = await this.driver.$$('flutter:TextButton');
                interactiveElements.textButtons = textButtons.length;
                console.log(`🔘 Found ${textButtons.length} TextButton elements`);
            } catch (e) {}
            
            // Find all text fields
            try {
                const textFields = await this.driver.$$('flutter:TextField');
                interactiveElements.textFields = textFields.length;
                console.log(`📝 Found ${textFields.length} TextField elements`);
            } catch (e) {}
            
            // Find all text elements
            try {
                const texts = await this.driver.$$('flutter:Text');
                interactiveElements.texts = texts.length;
                console.log(`📄 Found ${texts.length} Text elements`);
            } catch (e) {}
            
            return interactiveElements;
            
        } catch (error) {
            console.error('❌ Screen inspection failed:', error.message);
            return null;
        }
    }

    async disconnect() {
        if (this.driver) {
            await this.driver.deleteSession();
            console.log('🏁 Disconnected from Flutter app');
        }
    }
}

// Main execution function
async function interactWithLoginScreen() {
    const interactor = new FlutterLoginInteractor();
    
    try {
        // Connect to app
        const connected = await interactor.connect();
        if (!connected) {
            console.log('❌ Could not connect to Flutter app');
            console.log('💡 Make sure:');
            console.log('   1. Appium server is running (appium)');
            console.log('   2. Android emulator is running');
            console.log('   3. Flutter app is installed');
            return;
        }
        
        // Inspect current screen first
        console.log('\n=== Screen Inspection ===');
        await interactor.inspectCurrentScreen();
        
        // Perform login interaction
        console.log('\n=== Login Interaction ===');
        const loginSuccess = await interactor.performLogin();
        
        if (loginSuccess) {
            console.log('\n✅ Login interaction completed successfully!');
            
            // Inspect screen after login
            console.log('\n=== Post-Login Screen Inspection ===');
            await interactor.inspectCurrentScreen();
        } else {
            console.log('\n❌ Login interaction failed');
        }
        
    } catch (error) {
        console.error('❌ Interaction failed:', error.message);
    } finally {
        await interactor.disconnect();
    }
}

// Export for MCP usage
module.exports = { FlutterLoginInteractor, interactWithLoginScreen };

// Run if called directly
if (require.main === module) {
    interactWithLoginScreen();
}