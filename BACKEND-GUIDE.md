# Livestream Monitor Backend Guide

## Overview

The livestream-link-monitor supports dual backends:
1. **Google Sheets** (legacy, being phased out)
2. **StreamSource API** (recommended)

## Quick Configuration

### StreamSource API (Recommended)
```env
BACKEND_TYPE=streamsource
STREAMSOURCE_API_URL=http://streamsource:3000/api/v1
STREAMSOURCE_API_KEY=your_api_key_here
```

### Google Sheets (Legacy)
```env
BACKEND_TYPE=sheets
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_CREDENTIALS_PATH=./creds.json
```

### Dual Mode (Migration)
```env
BACKEND_TYPE=dual
# Include both configurations above
```

## Environment Variables

### Required
- `DISCORD_TOKEN` - Discord bot token
- `DISCORD_CHANNEL_ID` - Channel to monitor
- `BACKEND_TYPE` - Backend selection (sheets/streamsource/dual)

### Backend-Specific

**StreamSource:**
- `STREAMSOURCE_API_URL` - API endpoint
- `STREAMSOURCE_API_KEY` - Authentication key
- `ENABLE_BULK_OPERATIONS` - Batch processing (default: true)

**Google Sheets:**
- `GOOGLE_SHEET_ID` - Sheet identifier
- `GOOGLE_CREDENTIALS_PATH` - Service account JSON
- `SHEET_UPDATE_INTERVAL` - Update frequency (ms)

### Optional
- `LOG_LEVEL` - Logging detail (debug/info/warn/error)
- `RATE_LIMIT_MAX` - Max requests per window
- `DUPLICATE_CHECK_WINDOW` - Duplicate detection time (ms)

## Migration Guide

### From Sheets to StreamSource

1. **Enable dual mode:**
   ```env
   BACKEND_TYPE=dual
   ```

2. **Run with both backends** for verification

3. **Switch to API-only:**
   ```env
   BACKEND_TYPE=streamsource
   ```

4. **Remove Sheets config** when confident

## Troubleshooting

### Common Issues

**API Connection Failed:**
- Check `STREAMSOURCE_API_URL` is reachable
- Verify `STREAMSOURCE_API_KEY` is valid
- Ensure StreamSource service is running

**Google Sheets Auth Error:**
- Verify service account has Sheet access
- Check credentials file exists and is valid
- Ensure Sheet ID is correct

**Rate Limiting:**
- Adjust `RATE_LIMIT_MAX` if needed
- Enable `ENABLE_BULK_OPERATIONS` for efficiency

### Debug Mode
```env
LOG_LEVEL=debug
VERBOSE_LOGGING=true
```

## API Integration

### Adding Streams
```javascript
POST /api/v1/streams
{
  "url": "https://twitch.tv/example",
  "posted_by": "Discord#1234",
  "location": "City, State"
}
```

### Updating Status
```javascript
PATCH /api/v1/streams/:id
{
  "is_live": true,
  "viewer_count": 150
}
```

See [StreamSource API Docs](https://github.com/streamwall/streamsource/blob/main/README.md#api) for full reference.