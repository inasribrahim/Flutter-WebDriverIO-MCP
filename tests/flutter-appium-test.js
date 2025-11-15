// Flutter Appium Test Sample
const { remote } = require('webdriverio');
const flutterCapabilities = require('./flutter-capabilities.json');

async function runFlutterAppiumTest() {
    console.log('🚀 Starting Flutter Appium test...');
    
    // Flutter-specific capabilities
    const testCapabilities = {
        ...flutterCapabilities,
        'appium:deviceName': 'Medium_Phone_API_36',
        'appium:avd': 'Medium_Phone_API_36',
        'appium:automationName': 'Flutter',
        'appium:platformName': 'Android',
        'appium:platformVersion': '14.0',
        'appium:newCommandTimeout': 300,
        'appium:flutterSystemPort': 9999,
        'appium:flutterEnableObservatory': true,
        // Add your Flutter app details
        'appium:app': '/path/to/your/flutter/app.apk', // Update this with your Flutter app path
        'appium:appPackage': 'com.example.your_flutter_app', // Update with your app package
        'appium:appActivity': 'com.example.your_flutter_app.MainActivity' // Update with your main activity
    };
    
    let driver;
    
    try {
        // Connect to Appium server
        driver = await remote({
            protocol: 'http',
            hostname: 'localhost',
            port: 4723,
            path: '/',
            capabilities: testCapabilities
        });
        
        console.log('✅ Connected to Flutter app on Android emulator');
        
        // Wait for app to load
        await driver.pause(5000);
        
        // Flutter-specific commands
        console.log('🔍 Looking for Flutter widgets...');
        
        // Example: Find Flutter widgets by key
        try {
            // Replace 'myButton' with actual widget key from your Flutter app
            // const button = await driver.$('key=myButton');
            // await button.click();
            // console.log('✅ Flutter button clicked');
            
            // Example: Find by text
            // const textWidget = await driver.$('text=Welcome');
            // const isDisplayed = await textWidget.isDisplayed();
            // console.log(`📱 Welcome text displayed: ${isDisplayed}`);
            
            console.log('ℹ️  Add your Flutter widget interactions here');
            
        } catch (error) {
            console.log('⚠️  Flutter widgets not found - make sure your Flutter app is running');
        }
        
        // Take a screenshot
        const screenshot = await driver.takeScreenshot();
        console.log('📸 Screenshot taken successfully');
        
        // Get current context
        const contexts = await driver.getContexts();
        console.log('📱 Available contexts:', contexts);
        
        console.log('✅ Flutter Appium test completed successfully!');
        
    } catch (error) {
        console.error('❌ Flutter test failed:', error.message);
        console.log('\n🔧 Make sure:');
        console.log('1. Android emulator is running with your Flutter app');
        console.log('2. Appium server is started (appium)');
        console.log('3. Flutter driver is installed');
        console.log('4. Your Flutter app has flutter_driver dependency');
        console.log('5. App package and activity names are correct');
    } finally {
        if (driver) {
            await driver.deleteSession();
            console.log('🏁 Flutter test session ended');
        }
    }
}

// Flutter widget finder helpers
const FlutterFinder = {
    byKey: (key) => `key=${key}`,
    byText: (text) => `text=${text}`,
    byType: (type) => `type=${type}`,
    byValueKey: (key) => `valueKey=${key}`,
    byTooltip: (tooltip) => `tooltip=${tooltip}`,
    bySemantics: (label) => `semantics=${label}`
};

// Export for MCP usage
module.exports = { 
    runFlutterAppiumTest, 
    flutterCapabilities,
    FlutterFinder 
};

// Run directly if called
if (require.main === module) {
    runFlutterAppiumTest();
}