
// MCP-Appium Flutter Login Test Script
// Generated automatically for com.example.the_app_flutter

const { remote } = require('webdriverio');

async function mcpFlutterLoginTest() {
    const capabilities = {
        'appium:platformName': 'Android',
        'appium:deviceName': 'Medium_Phone_API_36',
        'appium:automationName': 'Flutter',
        'appium:appPackage': 'com.example.the_app_flutter',
        'appium:appActivity': 'com.example.the_app_flutter.MainActivity',
        'appium:flutterSystemPort': 9999,
        'appium:flutterEnableObservatory': true,
        'appium:noReset': true
    };
    
    const driver = await remote({
        protocol: 'http',
        hostname: 'localhost',
        port: 4723,
        path: '/',
        capabilities: capabilities
    });
    
    try {
        console.log('🔍 MCP-Appium: Connected to Flutter app');
        
        // Wait for login screen
        await driver.pause(3000);
        
        // Common Flutter login interactions
        // Adjust these selectors based on your app's widget structure
        
        // Find username/email field
        const usernameField = await driver.$('flutter:TextField');
        await usernameField.setValue('testuser@example.com');
        console.log('✅ MCP-Appium: Username entered');
        
        // Find password field (usually second TextField)
        const passwordField = await driver.$$('flutter:TextField')[1];
        await passwordField.setValue('password123');
        console.log('✅ MCP-Appium: Password entered');
        
        // Find and click login button
        const loginButton = await driver.$('flutter:ElevatedButton');
        await loginButton.click();
        console.log('✅ MCP-Appium: Login button clicked');
        
        // Wait for response
        await driver.pause(2000);
        
        // Take screenshot for verification
        const screenshot = await driver.takeScreenshot();
        console.log('📸 MCP-Appium: Screenshot taken');
        
        console.log('✅ MCP-Appium login test completed!');
        
    } finally {
        await driver.deleteSession();
    }
}

module.exports = { mcpFlutterLoginTest };

// Run if called directly
if (require.main === module) {
    mcpFlutterLoginTest().catch(console.error);
}
