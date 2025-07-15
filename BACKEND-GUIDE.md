# Livestream Monitor Backend Guide

## Overview

The livestream-link-monitor uses the StreamSource API backend.

## Quick Configuration

### StreamSource API (Recommended)
```env
BACKEND_TYPE=streamsource
STREAMSOURCE_API_URL=http://streamsource:3000/api/v1
STREAMSOURCE_API_KEY=your_api_key_here
```


## Environment Variables

### Required
- `DISCORD_TOKEN` - Discord bot token
- `DISCORD_CHANNEL_ID` - Channel to monitor
- `BACKEND_TYPE` - Backend selection (streamsource)

### Backend-Specific

**StreamSource:**
- `STREAMSOURCE_API_URL` - API endpoint
- `STREAMSOURCE_API_KEY` - Authentication key
- `ENABLE_BULK_OPERATIONS` - Batch processing (default: true)

### Optional
- `LOG_LEVEL` - Logging detail (debug/info/warn/error)
- `RATE_LIMIT_MAX` - Max requests per window
- `DUPLICATE_CHECK_WINDOW` - Duplicate detection time (ms)

## Troubleshooting

### Common Issues

**API Connection Failed:**
- Check `STREAMSOURCE_API_URL` is reachable
- Verify `STREAMSOURCE_API_KEY` is valid
- Ensure StreamSource service is running

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