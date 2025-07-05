# Backend Troubleshooting Guide

## Common Backend Issues and Solutions

### Google Sheets Backend

#### Error: "Google credentials file not found"
```
Error: Google credentials file not found at: ./credentials.json
```

**Solutions:**
1. Ensure `credentials.json` exists in the project root
2. Check the path in `GOOGLE_CREDENTIALS_PATH` environment variable
3. Download the service account key from Google Cloud Console
4. Verify file permissions: `ls -la credentials.json`

#### Error: "Permission denied" or "Insufficient permissions"
```
Error: The caller does not have permission
```

**Solutions:**
1. Share your Google Sheet with the service account email
2. Find the email in `credentials.json` under `client_email`
3. In Google Sheets: Share → Add the email → Editor permissions
4. Wait a few seconds for permissions to propagate

#### Error: "Column not found in sheet headers"
```
Warning: Column "Source" not found in sheet headers
```

**Solutions:**
1. Check your sheet's first row has the correct headers
2. Default headers: `Source | Platform | Status | Link | Added Date | Posted By | City | State`
3. Or update your `.env` to match your column names:
   ```bash
   COLUMN_SOURCE=YourSourceColumnName
   ```

#### Error: "Range not found"
```
Error: Unable to parse range: Livesheet!A2:A
```

**Solutions:**
1. Ensure all required tabs exist in your sheet
2. Required tabs: `Livesheet`, `Known Cities`, `Twitch User Ignorelist`, `Discord User Ignorelist`, `URL Ignorelist`
3. Or update tab names in `.env`:
   ```bash
   SHEET_TAB_LIVESTREAMS=YourTabName
   ```

### StreamSource Backend

#### Error: "Authentication failed"
```
Error: Failed to authenticate with StreamSource: HTTP 401
```

**Solutions:**
1. Verify email and password are correct
2. Check for special characters that need escaping in `.env`
3. Try logging in manually to verify credentials
4. Ensure the API URL is correct:
   ```bash
   STREAMSOURCE_API_URL=https://api.streamsource.com
   ```

#### Error: "Rate limit exceeded"
```
Error: StreamSource API request failed: HTTP 429
```

**Solutions:**
1. The backend automatically retries with exponential backoff
2. If persistent, reduce sync intervals:
   ```bash
   EXISTING_URLS_SYNC_INTERVAL=120000  # 2 minutes instead of 1
   ```
3. Check StreamSource API limits:
   - 1000 requests/minute general
   - 500 login attempts/20 minutes

#### Error: "Network error" or "ECONNREFUSED"
```
Error: fetch failed
Error: connect ECONNREFUSED
```

**Solutions:**
1. Check internet connectivity
2. Verify StreamSource API URL is accessible
3. Check for proxy/firewall blocking
4. Try curl to test: `curl https://api.streamsource.com/health`

### Dual Backend Mode Issues

#### Only One Backend Working
**Symptoms:** Logs show success for one backend but errors for another

**Solutions:**
1. Check both backends are enabled:
   ```bash
   BACKEND_GOOGLE_SHEETS_ENABLED=true
   BACKEND_STREAMSOURCE_ENABLED=true
   ```
2. Verify credentials for both backends
3. Check logs for specific backend errors
4. Test each backend individually first

#### Performance Issues
**Symptoms:** Slow response times, timeouts

**Solutions:**
1. In dual-write mode, operations wait for both backends
2. Consider using single mode if performance is critical
3. Check network latency to both services
4. Increase timeouts if needed

### General Backend Issues

#### Streams Not Being Saved
**Check these in order:**

1. **Backend Initialized?**
   ```
   Look for: "BackendManager initialized successfully"
   ```

2. **URL Validation Passing?**
   ```
   Look for: "Invalid URL rejected"
   Check: URL is from supported platform
   ```

3. **Duplicate Check?**
   ```
   Look for: "URL already exists"
   Solution: URL might already be in backend
   ```

4. **Backend Errors?**
   ```
   Look for: "Error adding to sheet" or "Error creating stream"
   Check: Backend-specific errors above
   ```

#### Deduplication Not Working
**Symptoms:** Duplicate entries appearing

**Solutions:**
1. Clear cache and restart:
   ```bash
   # Restart the application
   npm run dev
   ```
2. Check URL normalization is working
3. Verify existing URLs are being fetched on startup
4. For dual mode, check both backends for duplicates

#### Ignore Lists Not Working
**Symptoms:** Ignored users/URLs still being processed

**Solutions:**
1. Only Google Sheets supports ignore lists currently
2. Ensure Google Sheets backend is enabled
3. Check ignore list sync:
   ```
   Look for: "Loaded X users to ignore list"
   ```
4. Verify usernames are lowercase in sheets
5. For URLs, ensure they're normalized (with protocol)

### Debug Mode

Enable debug logging for more details:

```bash
LOG_LEVEL=debug
```

This will show:
- Detailed backend operations
- Full error stack traces
- API request/response data
- Cache operations

### Testing Backend Connection

#### Test Google Sheets
```javascript
// Quick test script (test-sheets.js)
require('dotenv').config();
const { google } = require('googleapis');

async function test() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID
    });
    console.log('✅ Connected to:', response.data.properties.title);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
```

#### Test StreamSource
```javascript
// Quick test script (test-streamsource.js)
require('dotenv').config();

async function test() {
  try {
    const response = await fetch(
      `${process.env.STREAMSOURCE_API_URL}/api/v1/users/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: process.env.STREAMSOURCE_EMAIL,
          password: process.env.STREAMSOURCE_PASSWORD
        })
      }
    );
    
    if (response.ok) {
      console.log('✅ StreamSource authentication successful');
    } else {
      console.error('❌ Error:', response.status, await response.text());
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

test();
```

### Getting Help

If you're still having issues:

1. **Check the logs** with `LOG_LEVEL=debug`
2. **Test each backend individually** before using dual mode
3. **Verify all environment variables** are set correctly
4. **Try the test scripts** above to isolate issues
5. **Check the backend service status** (Google Sheets API status, StreamSource uptime)

### Backend-Specific Limitations

#### Google Sheets
- API quota limits (usually generous)
- Maximum 10 million cells per spreadsheet
- Rate limits on writes (usually not an issue)

#### StreamSource
- No ignore list support via API
- No known cities management via API
- Requires authentication token refresh every 24 hours
- API rate limits enforced

Remember: When in doubt, start with Google Sheets only - it's the most stable and full-featured option.