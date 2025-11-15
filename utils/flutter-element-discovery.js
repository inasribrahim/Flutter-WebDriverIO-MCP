// Comprehensive Flutter App Element Discovery
const { remote } = require('webdriverio');

async function discoverLoginElements() {
    console.log('🔍 Comprehensive Flutter Login Screen Discovery');
    console.log('==============================================');

    const capabilities = {
        'appium:platformName': 'Android',
        'appium:platformVersion': '16',
        'appium:deviceName': 'Medium_Phone_API_36',
        'appium:automationName': 'Flutter',
        'appium:appPackage': 'com.example.the_app_flutter',
        'appium:appActivity': 'com.example.the_app_flutter.MainActivity',
        'appium:newCommandTimeout': 300,
        'appium:flutterSystemPort': 9999,
        'appium:flutterEnableObservatory': true,
        'appium:noReset': true,
        'appium:fullReset': false
    };

    let driver;
    
    try {
        driver = await remote({
            protocol: 'http',
            hostname: 'localhost',
            port: 4723,
            path: '/',
            capabilities: capabilities
        });
        
        console.log('✅ Connected to Flutter app');
        await driver.pause(3000);

        // Switch to native context for comprehensive discovery
        const contexts = await driver.getContexts();
        console.log('📱 Available contexts:', contexts);
        
        if (contexts.includes('NATIVE_APP')) {
            await driver.switchContext('NATIVE_APP');
            console.log('🔄 Switched to NATIVE_APP context');
            
            console.log('\n🔍 Discovering all UI elements...');
            
            // Get all elements in the view hierarchy
            try {
                const allElements = await driver.$$('//*');
                console.log(`📋 Found ${allElements.length} total elements`);
                
                // Analyze each element
                const elementSummary = {
                    clickable: [],
                    textInputs: [],
                    buttons: [],
                    texts: [],
                    images: [],
                    other: []
                };
                
                for (let i = 0; i < Math.min(50, allElements.length); i++) { // Limit to first 50 elements
                    try {
                        const element = allElements[i];
                        const tagName = await element.getTagName();
                        const text = await element.getText().catch(() => '');
                        const clickable = await element.getAttribute('clickable').catch(() => 'false');
                        const resourceId = await element.getAttribute('resource-id').catch(() => '');
                        const className = await element.getAttribute('class').catch(() => '');
                        const contentDesc = await element.getAttribute('content-desc').catch(() => '');
                        
                        const elementInfo = {
                            index: i,
                            tagName,
                            text: text ? text.substring(0, 50) : '',
                            clickable: clickable === 'true',
                            resourceId,
                            className,
                            contentDesc
                        };
                        
                        // Categorize elements
                        if (clickable === 'true') {
                            elementSummary.clickable.push(elementInfo);
                        }
                        
                        if (tagName.includes('EditText') || className.includes('EditText')) {
                            elementSummary.textInputs.push(elementInfo);
                        } else if (tagName.includes('Button') || className.includes('Button')) {
                            elementSummary.buttons.push(elementInfo);
                        } else if (tagName.includes('TextView') || className.includes('TextView')) {
                            elementSummary.texts.push(elementInfo);
                        } else if (tagName.includes('Image') || className.includes('Image')) {
                            elementSummary.images.push(elementInfo);
                        } else {
                            elementSummary.other.push(elementInfo);
                        }
                        
                    } catch (e) {
                        // Skip problematic elements
                    }
                }
                
                // Print categorized results
                console.log('\n📝 TEXT INPUT ELEMENTS:');
                elementSummary.textInputs.forEach(el => {
                    console.log(`   [${el.index}] ${el.tagName} - "${el.text}" (${el.resourceId})`);
                });
                
                console.log('\n🔘 CLICKABLE ELEMENTS:');
                elementSummary.clickable.forEach(el => {
                    console.log(`   [${el.index}] ${el.tagName} - "${el.text}" (${el.resourceId})`);
                });
                
                console.log('\n🔲 BUTTON ELEMENTS:');
                elementSummary.buttons.forEach(el => {
                    console.log(`   [${el.index}] ${el.tagName} - "${el.text}" (${el.resourceId})`);
                });
                
                console.log('\n📄 TEXT ELEMENTS (showing first 10):');
                elementSummary.texts.slice(0, 10).forEach(el => {
                    console.log(`   [${el.index}] ${el.tagName} - "${el.text}" (${el.resourceId})`);
                });
                
                // Try coordinate-based interaction with clickable elements
                console.log('\n🎯 Attempting coordinate-based interaction...');
                if (elementSummary.clickable.length > 0) {
                    for (let i = 0; i < Math.min(2, elementSummary.clickable.length); i++) {
                        try {
                            const element = allElements[elementSummary.clickable[i].index];
                            const location = await element.getLocation();
                            const size = await element.getSize();
                            
                            console.log(`   Element ${i + 1}: Location (${location.x}, ${location.y}), Size ${size.width}x${size.height}`);
                            
                            // Try to interact by clicking
                            await element.click();
                            console.log(`   ✅ Clicked element ${i + 1}`);
                            await driver.pause(2000);
                            
                            // Try typing if it might be an input field
                            try {
                                await element.setValue('test');
                                console.log(`   ✅ Successfully entered text in element ${i + 1}`);
                                await driver.pause(1000);
                            } catch (e) {
                                console.log(`   ℹ️  Element ${i + 1} is not a text input`);
                            }
                            
                        } catch (e) {
                            console.log(`   ❌ Could not interact with element ${i + 1}: ${e.message}`);
                        }
                    }
                }
                
                // Try using Flutter context for comparison
                console.log('\n🐦 Switching to Flutter context for comparison...');
                if (contexts.includes('FLUTTER')) {
                    await driver.switchContext('FLUTTER');
                    console.log('🔄 Switched to FLUTTER context');
                    
                    // Try basic Flutter commands
                    try {
                        // Try to get render tree
                        console.log('📋 Attempting to get Flutter render tree...');
                        // Note: This might not work with current Flutter driver implementation
                        
                    } catch (e) {
                        console.log('⚠️ Flutter render tree not available');
                    }
                }
                
            } catch (error) {
                console.error('❌ Element discovery failed:', error.message);
            }
        }
        
        // Take final screenshot
        const screenshot = await driver.takeScreenshot();
        console.log('📸 Final screenshot captured');
        
        console.log('\n✅ Element discovery completed!');
        console.log('\n💡 Next steps:');
        console.log('1. Check screenshot to see current app state');
        console.log('2. Use coordinate-based interaction if specific elements found');
        console.log('3. Try different selectors based on discovered elements');
        
    } catch (error) {
        console.error('❌ Discovery failed:', error.message);
    } finally {
        if (driver) {
            await driver.deleteSession();
            console.log('🏁 Discovery session ended');
        }
    }
}

// Export and run
module.exports = { discoverLoginElements };

if (require.main === module) {
    discoverLoginElements();
}