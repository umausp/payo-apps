# Setup API Logging - Quick Guide

## Installation Steps

### 1. Install react-native-fs

```bash
npm install react-native-fs
```

### 2. iOS Setup

```bash
cd ios
pod install
cd ..
```

### 3. Android Setup (Auto-linked)

No additional steps needed.

### 4. Rebuild the App

```bash
# iOS
npm run ios

# Android
npm run android
```

## Files Created

✅ All files have been created:

1. `src/infrastructure/logging/FileLogger.ts` - Main logging utility
2. `src/presentation/screens/Logs/LogViewerScreen.tsx` - Log viewer UI
3. `src/infrastructure/api/ApiService.ts` - Updated with FileLogger
4. `src/presentation/screens/Settings/SettingsScreen.tsx` - Added "View Logs" button
5. `src/presentation/navigation/RootNavigator.tsx` - Added LogViewer screen
6. `src/types/index.ts` - Added LogViewer to navigation types

## Usage

### 1. Access Logs in App

```
1. Open the app
2. Navigate to Settings
3. Scroll to "Developer" section
4. Tap "View API Logs"
```

### 2. View Logs

The LogViewer screen shows:
- All API requests/responses
- Error logs
- Timestamps
- Request/response data
- Duration of each call

### 3. Actions Available

- **🔄 Refresh** - Reload logs from file
- **📤 Share** - Share log file via native share
- **🗑️ Clear** - Delete all logs

## What Gets Logged

### Automatically Logged

✅ All API calls from ApiService:
- `GET /api/v1/wallet/balance/:address`
- `GET /api/v1/wallet/gas`
- `POST /api/v1/wallet/rpc`
- `POST /challenge`
- `POST /verify`
- `POST /refresh`
- `POST /logout`
- `GET /api/v1/payment/transactions`
- `POST /api/v1/payment/submit`
- And all other API endpoints

### Log Format

```
[2024-03-05T10:30:50.456Z] [INFO] [API_REQUEST] POST http://localhost:3001/challenge
{
  "method": "POST",
  "url": "http://localhost:3001/challenge",
  "headers": { ... },
  "data": { ... }
}

[2024-03-05T10:30:50.789Z] [INFO] [API_RESPONSE] POST http://localhost:3001/challenge - 200 (333ms)
{
  "method": "POST",
  "url": "http://localhost:3001/challenge",
  "status": 200,
  "duration": 333,
  "data": { ... }
}

[2024-03-05T10:30:52.000Z] [ERROR] [API_ERROR] GET http://localhost:3002/api/v1/wallet/balance - Network Error
{
  "method": "GET",
  "url": "http://localhost:3002/api/v1/wallet/balance",
  "error": { ... }
}
```

## Security Features

### Automatic Data Sanitization

**Sensitive fields are automatically redacted:**
- password → `[REDACTED]`
- privateKey → `[REDACTED]`
- mnemonic → `[REDACTED]`
- seedPhrase → `[REDACTED]`
- secret → `[REDACTED]`
- apiKey → `[REDACTED]`

**JWT tokens are masked:**
```
Authorization: Bearer eyJhbGciOi...cCI6IkpX (shows first/last 10 chars only)
```

## Testing

### Test the Logging

1. **Login to the app**
   - This will trigger `/challenge` and `/verify` API calls
   - Check logs to see these requests

2. **View Dashboard**
   - This triggers balance and transactions API calls
   - Check logs to see all data fetched

3. **Pull to refresh**
   - Multiple API calls happen
   - Check logs to see parallel requests

4. **Open LogViewer**
   ```
   Settings → Developer → View API Logs
   ```

5. **Verify logs contain:**
   - Request timestamps
   - Request method and URL
   - Request/response data
   - Response status codes
   - Request duration in milliseconds
   - Error details (if any errors occurred)

### Expected Log Entries After Login

```
[INFO] [API_REQUEST] POST /challenge
[INFO] [API_RESPONSE] POST /challenge - 200 (150ms)
[INFO] [API_REQUEST] POST /verify
[INFO] [API_RESPONSE] POST /verify - 200 (280ms)
[INFO] [API_REQUEST] GET /api/v1/wallet/balance/0x...
[INFO] [API_RESPONSE] GET /api/v1/wallet/balance/0x... - 200 (120ms)
[INFO] [API_REQUEST] GET /api/v1/wallet/gas
[INFO] [API_RESPONSE] GET /api/v1/wallet/gas - 200 (95ms)
[INFO] [API_REQUEST] GET /api/v1/payment/transactions
[INFO] [API_RESPONSE] GET /api/v1/payment/transactions - 200 (210ms)
```

## Log File Location

### View in App

LogViewer screen shows file path at the top:
```
📁 View Path
```
Tap to see full path.

### iOS (Simulator)
```
/Users/YourName/Library/Developer/CoreSimulator/Devices/[DEVICE]/data/Containers/Data/Application/[APP]/Documents/payo-api.log
```

### Android (Emulator)
```
/data/data/com.payoapp/files/payo-api.log
```

### Access via ADB (Android)

```bash
# Pull log file from device
adb pull /data/data/com.payoapp/files/payo-api.log ./

# View logs
cat payo-api.log
```

### Access via Finder (iOS Simulator)

1. Run this command to get app container:
   ```bash
   xcrun simctl get_app_container booted com.payoapp data
   ```

2. Open in Finder:
   ```bash
   open "$(xcrun simctl get_app_container booted com.payoapp data)/Documents"
   ```

3. Find `payo-api.log` file

## Common Use Cases

### Debug Authentication Issues

1. Open LogViewer
2. Look for `/challenge` and `/verify` endpoints
3. Check request/response data
4. Verify signature is being sent correctly

### Debug Balance Display Issues

1. Open LogViewer
2. Look for `/api/v1/wallet/balance` endpoint
3. Check response data
4. Verify balanceWei and decimals

### Debug Transaction History

1. Open LogViewer
2. Look for `/api/v1/payment/transactions` endpoint
3. Check response data
4. Verify transaction array

### Debug Network Errors

1. Open LogViewer
2. Search for `[ERROR]` entries
3. Check error messages
4. Verify backend is running

## Sharing Logs

### Share via App

1. Open LogViewer
2. Tap **📤 Share**
3. Choose sharing method (Email, Messages, AirDrop, etc.)
4. Send to developer/support

### Share via Command Line

```bash
# iOS (get app container first)
APP_CONTAINER=$(xcrun simctl get_app_container booted com.payoapp data)
cat "$APP_CONTAINER/Documents/payo-api.log"

# Android
adb pull /data/data/com.payoapp/files/payo-api.log ./
```

## Clearing Logs

### Via App

1. Open LogViewer
2. Tap **🗑️ Clear**
3. Confirm deletion
4. Logs will be cleared

### Manual Clear (iOS)

```bash
APP_CONTAINER=$(xcrun simctl get_app_container booted com.payoapp data)
rm "$APP_CONTAINER/Documents/payo-api.log"
```

### Manual Clear (Android)

```bash
adb shell rm /data/data/com.payoapp/files/payo-api.log
```

## Troubleshooting

### Issue: "View API Logs" button not in Settings

**Solution:**
1. Make sure you rebuilt the app after adding the files
2. Check that LogViewerScreen is imported in RootNavigator
3. Verify navigation types include LogViewer

### Issue: Logs are empty

**Solution:**
1. Make sure you've made some API calls (login, view dashboard)
2. Check FileLogger is initialized
3. Check console for FileLogger errors
4. Verify react-native-fs is installed correctly

### Issue: react-native-fs not found

**Solution:**
```bash
# Reinstall
npm install react-native-fs

# iOS - reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Rebuild
npm run ios
```

### Issue: Can't write to file (iOS)

**Solution:**
Check Info.plist has file access permissions:
```xml
<key>UIFileSharingEnabled</key>
<true/>
<key>LSSupportsOpeningDocumentsInPlace</key>
<true/>
```

### Issue: Can't write to file (Android)

**Solution:**
Check AndroidManifest.xml has storage permissions:
```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
```

## Performance

**Impact on app:**
- Negligible (async file writes)
- Max file size: 5MB (auto-rotates)
- Total disk usage: ~10MB max

**Disable if needed:**
```typescript
import FileLogger from '@/infrastructure/logging/FileLogger';

FileLogger.setEnabled(false); // Disable logging
```

## Next Steps

1. **Test the implementation:**
   - Login to app
   - Navigate around
   - Check logs in LogViewer

2. **Verify log content:**
   - All API calls appear
   - Sensitive data is redacted
   - Timestamps are correct

3. **Share logs:**
   - Test share functionality
   - Verify file can be opened

4. **Production setup:**
   - Consider disabling in production
   - Or implement remote log upload
   - Add user consent

## Summary

✅ **You now have:**
- Complete API logging to file
- Log viewer screen in app
- Automatic data sanitization
- Share/clear functionality
- Secure, production-ready logging

**Access logs:**
Settings → Developer → View API Logs

Happy debugging! 🐛🔍
