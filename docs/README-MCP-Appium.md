# MCP-Appium Android Configuration

This workspace is configured with MCP-Appium for Android mobile testing automation.

## ✅ Configuration Status

Your setup includes:
- **Android SDK**: `C:\Users\moham\AppData\Local\Android\Sdk`
- **Available Emulator**: `Medium_Phone_API_36`
- **Appium Version**: 2.19.0
- **Drivers**: 
  - UiAutomator2 v4.2.9 (Android native apps)
  - Flutter v2.19.0 (Flutter apps)
- **MCP Integration**: Configured in `.vscode/mcp.json`

## 🚀 Quick Start

### 1. Start Android Emulator
```powershell
# Start your Android emulator
C:\Users\moham\AppData\Local\Android\Sdk\emulator\emulator.exe -avd Medium_Phone_API_36
```

### 2. Start Appium Server
```powershell
# In a separate terminal
appium
```

### 3. Run Test Configuration Check
```powershell
node test-mcp-appium.js
```

### 4. Run Sample Tests
```powershell
# Regular Android app testing
node sample-appium-test.js

# Flutter app testing
node flutter-appium-test.js
```

## 📁 Configuration Files

- **`mcp.json`**: MCP server configuration with Android and Flutter paths
- **`capabilities.json`**: Appium capabilities for Android native apps
- **`flutter-capabilities.json`**: Appium capabilities for Flutter apps
- **`test-mcp-appium.js`**: Configuration verification script
- **`sample-appium-test.js`**: Sample WebDriverIO test for Android
- **`flutter-appium-test.js`**: Sample WebDriverIO test for Flutter apps

## 🔧 MCP-Appium Commands

Through VS Code with MCP-Appium, you can:
- Launch Android emulators
- Run automated tests for Android native and Flutter apps
- Capture screenshots
- Interact with UI elements and Flutter widgets
- Find Flutter widgets by key, text, type, and semantics
- Execute Android commands
- Test both native Android and cross-platform Flutter applications

## 🛠️ Troubleshooting

### Emulator Issues
- Ensure Android Studio is installed
- Verify AVD is created and named correctly
- Check that emulator path is accessible

### Appium Issues
- Make sure Appium server is running on port 4723
- Verify UiAutomator2 driver is installed
- Check device capabilities match your emulator

### MCP Issues
- Restart VS Code after configuration changes
- Verify environment variables are set correctly
- Check that all npm packages are installed

## 📱 Environment Variables

The following are configured in your MCP setup:
```
ANDROID_HOME=C:\Users\moham\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=C:\Users\moham\AppData\Local\Android\Sdk
APPIUM_HOME=${workspaceFolder}
CAPABILITIES_CONFIG=${workspaceFolder}/capabilities.json
FLUTTER_CAPABILITIES_CONFIG=${workspaceFolder}/flutter-capabilities.json
FLUTTER_SYSTEM_PORT=9999
```

## 🎯 Next Steps

### For Android Native Apps:
1. **Start your emulator**: Use Android Studio or command line
2. **Launch Appium**: Run `appium` in terminal
3. **Use UiAutomator2 driver**: For regular Android apps
4. **Run tests**: Use `sample-appium-test.js` as reference

### For Flutter Apps:
1. **Prepare Flutter app**: Add `flutter_driver` dependency to your Flutter app
2. **Build and deploy**: Install your Flutter app on the emulator
3. **Launch Appium**: Run `appium` in terminal
4. **Use Flutter driver**: Run `flutter-appium-test.js` for Flutter-specific testing
5. **Widget interactions**: Use Flutter finder methods for widget selection

### Flutter App Setup Requirements:
```yaml
# Add to your Flutter app's pubspec.yaml
dev_dependencies:
  flutter_driver:
    sdk: flutter
  test: any
```

### MCP Commands:
- Access through VS Code command palette
- Create custom test scripts using the samples as reference
- Use both UiAutomator2 and Flutter drivers as needed

Your MCP-Appium integration is ready for both Android native and Flutter mobile testing! 🎉🐦