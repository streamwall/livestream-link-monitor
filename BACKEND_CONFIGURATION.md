# Backend Configuration Guide

This livestream link monitor now supports multiple backends for storing stream data. You can use Google Sheets, StreamSource API, or both simultaneously.

## Available Backends

### Google Sheets (Default)
The original backend that stores stream data in a Google Spreadsheet.

### StreamSource API
A dedicated streaming management API with advanced features.

## Configuration Options

### Backend Mode

Set `BACKEND_MODE` to control how backends are used:

- `single` (default) - Use only the primary backend
- `dual-write` - Write to all enabled backends (useful for testing)
- `migrate` - Transition mode for migrating between backends

### Primary Backend

Set `BACKEND_PRIMARY` to choose your main backend:
- `googleSheets` (default)
- `streamSource`

### Enable/Disable Backends

- `BACKEND_GOOGLE_SHEETS_ENABLED` - Set to `false` to disable Google Sheets
- `BACKEND_STREAMSOURCE_ENABLED` - Set to `true` to enable StreamSource

## Google Sheets Configuration

Required environment variables:
```bash
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_CREDENTIALS_PATH=./credentials.json
```

## StreamSource Configuration

Required environment variables:
```bash
STREAMSOURCE_API_URL=https://api.streamsource.com
STREAMSOURCE_EMAIL=your_email@example.com
STREAMSOURCE_PASSWORD=your_secure_password
```

## Example Configurations

### Continue using Google Sheets only (default)
```bash
# No changes needed, this is the default configuration
```

### Switch to StreamSource only
```bash
BACKEND_MODE=single
BACKEND_PRIMARY=streamSource
BACKEND_GOOGLE_SHEETS_ENABLED=false
BACKEND_STREAMSOURCE_ENABLED=true
STREAMSOURCE_EMAIL=your_email@example.com
STREAMSOURCE_PASSWORD=your_password
```

### Use both backends (dual-write mode)
```bash
BACKEND_MODE=dual-write
BACKEND_PRIMARY=googleSheets
BACKEND_GOOGLE_SHEETS_ENABLED=true
BACKEND_STREAMSOURCE_ENABLED=true
STREAMSOURCE_EMAIL=your_email@example.com
STREAMSOURCE_PASSWORD=your_password
```

### Migration mode (testing StreamSource while keeping Google Sheets)
```bash
BACKEND_MODE=migrate
BACKEND_PRIMARY=googleSheets
BACKEND_GOOGLE_SHEETS_ENABLED=true
BACKEND_STREAMSOURCE_ENABLED=true
STREAMSOURCE_EMAIL=your_email@example.com
STREAMSOURCE_PASSWORD=your_password
```

## Important Notes

### Ignore Lists
- Currently, ignore lists (Twitch users, Discord users, URLs) are only supported in Google Sheets
- StreamSource backend will return empty ignore lists
- If using StreamSource as primary, consider keeping Google Sheets enabled for ignore list management

### Known Cities
- Location parsing depends on the "Known Cities" data
- Currently only available in Google Sheets
- StreamSource backend will not provide city data for location parsing
- Keep Google Sheets enabled if you need location parsing functionality

### Feature Parity
The StreamSource API is still developing. Current limitations:
- No ignore list management via API
- No known cities management via API
- No bulk export functionality (without feature flag)

### Authentication
- StreamSource uses JWT authentication with 24-hour token expiration
- The backend automatically handles authentication on startup
- Tokens are refreshed as needed

### Rate Limiting
- StreamSource API has rate limits:
  - 1000 requests/minute general limit
  - 500 login attempts per 20 minutes
  - 300 signup attempts per hour
- The backend implements automatic retry with exponential backoff

## Migration Guide

To migrate from Google Sheets to StreamSource:

1. Enable both backends in dual-write mode
2. Let the system run for a while to ensure StreamSource is working correctly
3. Use the backend manager's migration helper (if needed) to copy existing data
4. Switch primary backend to StreamSource
5. Optionally disable Google Sheets backend

## Troubleshooting

### StreamSource Authentication Failed
- Check your email and password are correct
- Ensure the StreamSource API URL is accessible
- Check logs for specific error messages

### Missing Features in StreamSource
- Keep Google Sheets enabled for ignore lists and known cities
- Monitor StreamSource API updates for new features

### Performance Issues
- In dual-write mode, operations take longer as they write to both backends
- Consider using single mode for production once you've chosen a backend