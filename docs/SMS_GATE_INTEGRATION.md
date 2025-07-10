# SMS-Gate Integration GAdd the following environment variables to your `.env` file:

```env
# SMS Provider Configuration
SMS_PROVIDER=smsgate

# SMS-Gate Configuration
SMSGATE_BASE_URL=your url
SMSGATE_USERNAME=your_username
SMSGATE_PASSWORD=your_password
SMSGATE_SIM_NUMBER=1  # Optional: 1 or 2 for dual SIM devices
```Overview

SMS-Gate is an Android app that allows you to send SMS messages through your Android device via a REST API. This integration allows YathraGo to use your Android device as an SMS gateway.

## Setup SMS-Gate App

1. **Download and Install**
   - Download the SMS Gateway for Android app from the Google Play Store or GitHub
   - Install it on your Android device

2. **Configure the App**
   - Open the app and set up a username and password
   - Note down the local IP address and port (usually runs on port 8080)
   - Ensure your Android device is connected to the same network as your server

3. **Get Configuration Details**
   - Base URL: `http://YOUR_ANDROID_DEVICE_IP:8080`
   - Username: The username you set in the app
   - Password: The password you set in the app

## Environment Configuration

Add the following environment variables to your `.env` file:

```env
# SMS Provider Configuration
SMS_PROVIDER=smsgate

# SMS-Gate Configuration
SMSGATE_BASE_URL=http://YOUR_ANDROID_IP:8080/
SMSGATE_USERNAME=your_username
SMSGATE_PASSWORD=your_password
```

## Configuration Options

- **SMSGATE_BASE_URL**: The full API endpoint URL including version (e.g., `http://192.168.1.100:8080/v1`)
- **SMSGATE_USERNAME**: Username configured in the SMS-Gate app
- **SMSGATE_PASSWORD**: Password configured in the SMS-Gate app
- **SMSGATE_SIM_NUMBER**: Optional - SIM card to use (1 or 2) for dual SIM devices. Leave empty to use the default SIM.

## SIM Card Selection

For devices with dual SIM capability:

1. **SIM 1**: Set `SMSGATE_SIM_NUMBER=1`
2. **SIM 2**: Set `SMSGATE_SIM_NUMBER=2`
3. **Default SIM**: Leave `SMSGATE_SIM_NUMBER` empty or remove the line

The system will log which SIM is being used for each message.

## Features

- ✅ Send OTP messages with formatted spacing (e.g., "12 34 56")
- ✅ Send general SMS messages
- ✅ Automatic phone number formatting
- ✅ Error handling and logging
- ✅ Network connectivity checks
- ✅ Authentication validation

## Testing

To test the SMS-Gate integration:

1. Ensure your Android device is running the SMS-Gate app
2. Set the environment variables correctly
3. Set `SMS_PROVIDER=smsgate` in your `.env` file
4. Start the backend server
5. Test by sending an OTP or SMS through the API

## Error Handling

The SMS-Gate gateway handles various error scenarios:

- **Network errors**: When the Android device is unreachable
- **Authentication errors**: When credentials are incorrect
- **Configuration errors**: When required environment variables are missing
- **API errors**: When the SMS-Gate API returns an error

## Logs

Check the application logs for SMS-Gate related messages:

- Successful SMS sending will log the message ID
- Errors will be logged with detailed error information
- Configuration issues will be logged during startup

## Network Requirements

- Your backend server must be able to reach your Android device's IP address
- The Android device must be connected to a network
- Port 8080 (or configured port) must be accessible
- SMS permissions must be granted to the SMS-Gate app on Android

## Common Issues and Solutions

### "Unexpected end of JSON input" Error

This error typically occurs when:

1. **SMS-Gate app is not running**: Ensure the SMS Gateway for Android app is running on your device
2. **Wrong base URL**: Check that your `SMSGATE_BASE_URL` is correct
3. **Network connectivity**: Ensure your backend server can reach the Android device
4. **Port not accessible**: Verify the port (usually 8080) is accessible

**Solution Steps:**
1. Check SMS-Gate app status on Android device
2. Verify base URL format: `http://DEVICE_IP:PORT/v1`
3. Test connectivity: `curl http://DEVICE_IP:PORT/v1/health`
4. Check firewall settings on both devices

### "Network error" or "ECONNREFUSED"

This indicates the SMS-Gate server is not reachable:

1. **Device IP changed**: Android device IP might have changed
2. **WiFi network**: Ensure both devices are on the same network
3. **Port blocked**: Check if port 8080 is blocked by firewall

**Solution Steps:**
1. Check current IP of Android device in SMS-Gate app
2. Update `SMSGATE_BASE_URL` with correct IP
3. Test with: `ping DEVICE_IP`
4. Check firewall/router settings

### "Cannot read properties of undefined (reading 'error')" Error

This error occurs during the SMS-Gate connection test when the health check response doesn't have the expected structure:

**Possible Causes:**
1. **Outdated SMS-Gate app version**: Older versions may return different response formats
2. **Network connectivity issues**: Partial response received
3. **API endpoint mismatch**: Using wrong API version

**Solution Steps:**
1. Update the SMS-Gate app to the latest version
2. Verify the base URL format: `http://DEVICE_IP:PORT/v1`
3. Check network connectivity between server and Android device
4. Enable debug logging to see the actual response:
   ```env
   LOG_LEVEL=debug
   ```
5. The error doesn't prevent SMS sending - it's just a connection test issue

**Note:** This error only affects the startup connection test. SMS sending functionality will still work normally.

## Troubleshooting

1. **Cannot connect to SMS-Gate**
   - Check if the Android device IP is correct
   - Verify the port number (default: 8080)
   - Ensure both devices are on the same network

2. **Authentication failed**
   - Verify username and password in the SMS-Gate app
   - Check the environment variables

3. **SMS not sending**
   - Check if the Android device has network connectivity
   - Verify SMS permissions are granted to the app
   - Check the phone number format

## Verifying Error Logging

To ensure that all SMS-Gate errors are properly logged to the terminal, follow these steps:

### 1. Check Terminal Output

When an SMS fails, you should see error logs in your terminal/console output. All error types should be logged:

```
[Nest] 12345  - 01/01/2024, 12:00:00 PM   ERROR [SmsGateSmsGateway] SMS send failed to +1234567890: HTTP 400: Invalid phone number format
[Nest] 12345  - 01/01/2024, 12:00:00 PM   ERROR [SmsGateSmsGateway] [BAD REQUEST] SMS to +1234567890 failed - Invalid request: HTTP 400: Invalid phone number format
```

### 2. Error Types That Should Always Be Logged

- **Network Errors**: Connection refused, timeout, etc.
- **HTTP 400**: Bad request (invalid phone number, message format)
- **HTTP 401**: Authentication failed (wrong credentials)
- **HTTP 404**: API endpoint not found
- **HTTP 500**: SMS-Gate server error
- **JSON Parsing Errors**: Invalid response format
- **Unknown Errors**: Any unexpected error types

### 3. Test Error Logging

You can manually test error logging by triggering different error scenarios in your application:

- Send SMS to an invalid phone number (should trigger HTTP 400)
- Use wrong credentials (should trigger HTTP 401)  
- Try connecting to wrong URL (should trigger network error)

Monitor your application logs to verify that all errors are properly logged to the terminal.

### 4. Debug Logging

For detailed debugging, you can enable debug logging by setting the log level:

```bash
# In your .env file
LOG_LEVEL=debug
```

With debug logging enabled, you'll see:
- HTTP request details (method, URL)
- HTTP response details (status, body)
- JSON parsing attempts
- Connection test results

### 5. Common Error Patterns

If errors are not appearing in the terminal, check:

1. **Log Level**: Ensure your logger is configured to show ERROR level messages
2. **Console Output**: Check that your application isn't suppressing console output
3. **Error Handling**: Verify that errors aren't being caught and silently ignored elsewhere

### 6. Troubleshooting Missing Logs

If some errors aren't appearing in the terminal:

```typescript
// Check if your logger is working
this.logger.error('Test error message');

// Check if console.error works
console.error('Direct console test');

// Verify the error object
console.log('Error details:', JSON.stringify(error, null, 2));
```

## References

- [SMS-Gate Documentation](https://docs.sms-gate.app/)
- [SMS-Gate Client TypeScript](https://github.com/android-sms-gateway/client-ts)
- [NPM Package](https://www.npmjs.com/package/android-sms-gateway)
