# iOS Flutter Automation CI

This repository contains a comprehensive GitHub Actions workflow for running Flutter automation tests on iOS simulators with Allure reporting.

## 🚀 Features

- **iOS Simulator Integration**: Automated setup and management of iOS simulators
- **Flutter Test Automation**: Login automation using Appium and WebDriverIO
- **Allure Reporting**: Professional test reports with screenshots
- **CI/CD Pipeline**: Automated test execution on every push/PR
- **Artifact Management**: Test results and screenshots uploaded as artifacts
- **GitHub Pages**: Allure reports published to GitHub Pages

## 📋 Prerequisites

- Flutter app with iOS build capability
- GitHub repository with Actions enabled
- iOS app bundle or Simulator-compatible build

## 🔧 Configuration

### Environment Variables

The workflow uses these environment variables (defined in `.github/workflows/simulator.yml`):

```yaml
env:
  SIMULATOR_NAME: "iPhone 15"
  PLATFORM_VERSION: "17.0"
  FLUTTER_VERSION: "3.16.0"
  APPIUM_VERSION: "2.19.0"
  XCODE_VERSION: "15.0"
```

### iOS Capabilities

Configure your Flutter app settings in `ios-flutter-capabilities.json`:

```json
{
  "platformName": "iOS",
  "appium:platformVersion": "17.0",
  "appium:deviceName": "iPhone 15",
  "appium:automationName": "XCUITest",
  "appium:bundleId": "com.example.flutter_app"
}
```

## 🏃‍♂️ Running Tests

### Local Development

```bash
# Install dependencies
npm install

# Run single test
node ios-flutter-test-runner.js single demouser demopass123

# Run test suite
node ios-flutter-test-runner.js suite
```

### GitHub Actions

Tests run automatically on:
- Push to `main` or `master` branch
- Pull requests to `main` or `master` branch
- Manual workflow dispatch

## 📊 Test Reports

### Allure Reports
- **HTML Report**: `allure-results/test-report.html`
- **Screenshots**: `screenshots/` directory
- **GitHub Pages**: Published automatically to `gh-pages` branch

### Artifacts
- Test reports are uploaded as GitHub Actions artifacts
- Screenshots are included in test artifacts
- Reports are retained for 30 days

## 🔍 Test Structure

### Test Cases
- **Login Automation**: Username/password form filling
- **Screenshot Capture**: Before/after each test step
- **Error Handling**: Comprehensive error capture and reporting

### iOS-Specific Features
- XCUITest automation framework
- iOS accessibility identifier support
- Native iOS element interaction
- Simulator lifecycle management

## 📱 Supported iOS Versions

- iOS 16.0+
- iPhone simulators (iPhone 14, iPhone 15, etc.)
- Xcode 14.0+

## 🛠️ Customization

### Adding New Test Cases

1. Extend the test matrix in `.github/workflows/simulator.yml`
2. Add new test methods in `ios-flutter-test-runner.js`
3. Update capabilities if needed

### Custom App Configuration

1. Update `appium:bundleId` in `ios-flutter-capabilities.json`
2. Add app installation step in workflow
3. Configure app-specific element selectors

## 📈 Monitoring

- **GitHub Actions**: View workflow runs and logs
- **Allure Reports**: Detailed test execution reports
- **Screenshots**: Visual verification of test steps
- **Artifacts**: Download test results and logs

## 🚨 Troubleshooting

### Common Issues

1. **Simulator Boot Failure**: Check Xcode version compatibility
2. **App Not Found**: Verify bundle ID and app installation
3. **Element Not Found**: Update iOS element selectors
4. **Appium Connection**: Check server startup and port availability

### Debug Steps

1. Check GitHub Actions logs
2. Review Appium server logs
3. Examine screenshot artifacts
4. Verify iOS simulator status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add/modify tests as needed
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

