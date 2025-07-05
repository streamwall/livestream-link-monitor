# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Livestream Link Monitor is a Node.js application that monitors Twitch chat and Discord channels for livestream links, extracts location information from messages, and records new links to a configurable backend (Google Sheets, StreamSource API, or both).

## Commands

### Development
- `npm install` - Install dependencies
- `npm start` - Run the application
- `npm run dev` - Run with nodemon for auto-restart on changes

### Docker Deployment
- `docker compose up -d` - Build and run the application in detached mode
- `docker compose logs -f` - View live logs
- `docker compose down` - Stop the application
- `docker compose build --no-cache` - Rebuild the Docker image

### Testing
- `node test-sheets.js` - Test Google Sheets connection
- `node test-streamsource.js` - Test StreamSource connection

## Architecture

### File Structure
```
livestream-link-monitor/
├── index.js                    # Main application entry point
├── config.js                   # Centralized environment variable management
├── lib/
│   ├── backends/              # Backend implementations
│   │   ├── BaseBackend.js     # Abstract base class for backends
│   │   ├── BackendManager.js  # Manages multiple backends
│   │   ├── GoogleSheetsBackend.js  # Google Sheets implementation
│   │   └── StreamSourceBackend.js  # StreamSource API implementation
│   ├── locationParser.js      # City/state extraction from messages
│   ├── platformDetector.js    # Platform detection and URL normalization
│   ├── rateLimiter.js        # Per-user rate limiting
│   └── urlValidator.js       # URL security validation
├── .env.example              # Example environment configuration
├── docker-compose.yml        # Docker configuration
├── Dockerfile               # Container definition
└── docs/                    # Documentation files
```

### Core Components

1. **Message Monitoring** (index.js:236-310)
   - Discord.js client monitors specified Discord channel for messages
   - TMI.js client monitors specified Twitch channel chat
   - Both extract URLs using regex patterns for major streaming platforms
   - Implements rate limiting per user to prevent spam
   - Sends confirmation feedback (Discord reaction, Twitch reply) when URLs are added

2. **URL Processing Pipeline** (index.js:259-298)
   - Validates URLs for security (lib/urlValidator.js)
   - Normalizes URLs to ensure proper protocol
   - Resolves TikTok redirect URLs to canonical form
   - Checks if URL already exists in backend
   - Detects platform (Twitch, YouTube, TikTok, Kick, Facebook)
   - Parses location (city/state) from message content (lib/locationParser.js)
   - Adds new URLs with location data to configured backend
   - Returns success/failure for confirmation feedback

3. **Backend System** (lib/backends/)
   - **BaseBackend.js**: Abstract interface all backends must implement
   - **BackendManager.js**: Coordinates multiple backends, handles modes
   - **GoogleSheetsBackend.js**: Full-featured Google Sheets integration
   - **StreamSourceBackend.js**: REST API integration with JWT auth
   
   Backend Modes:
   - `single`: Use only the primary backend
   - `dual-write`: Write to all enabled backends
   - `migrate`: Transition mode for safe migration

4. **Deduplication System**
   - Each backend maintains its own cache of existing URLs
   - Backend manager checks across all enabled backends
   - Syncs periodically based on EXISTING_URLS_SYNC_INTERVAL (default: 60s)
   - Prevents duplicate entries across backends
   - Cache operations are mutex-protected for thread safety

5. **Ignore List System** (Google Sheets only)
   - Three types: Twitch users, Discord users, URLs
   - Fetches from configurable Google Sheets tabs
   - Syncs periodically based on IGNORE_LIST_SYNC_INTERVAL (default: 10s)
   - Normalizes values (trim whitespace, lowercase usernames, normalize URLs)
   - Filters messages before URL extraction and processing

6. **Location Parsing System** (lib/locationParser.js)
   - Fetches known cities from backend (Google Sheets only currently)
   - Caches city/state data with normalized lookups
   - Supports common city aliases:
     - NYC → New York City
     - LA → Los Angeles
     - SF → San Francisco
     - DC → Washington
   - Case-insensitive matching with multiple parsing strategies
   - Handles "city, state" and "city ST" patterns
   - Syncs periodically based on KNOWN_CITIES_SYNC_INTERVAL (default: 5m)

7. **Platform Detection** (lib/platformDetector.js)
   - Supported platforms:
     - Twitch (twitch.tv)
     - YouTube (youtube.com, youtu.be)
     - TikTok (tiktok.com)
     - Kick (kick.com)
     - Facebook (facebook.com, fb.watch)
   - Extracts usernames from URLs where possible
   - Normalizes URLs (adds protocol, resolves redirects)

8. **Security Features**
   - **Rate Limiting** (lib/rateLimiter.js): Configurable per-user limits
   - **URL Validation** (lib/urlValidator.js): 
     - Blocks private IPs
     - Validates protocols (http/https only)
     - Domain allowlist for streaming platforms
   - **Input Sanitization**: Message length limits
   - **Docker Security**: Runs as non-root user
   - **Graceful Shutdown**: Handles signals properly

## Configuration

All configuration via environment variables (see ENVIRONMENT_VARIABLES.md):

### Required
- `DISCORD_TOKEN`: Discord bot token
- `DISCORD_CHANNEL_ID`: Channel to monitor
- `TWITCH_CHANNEL`: Twitch channel (no #)
- `GOOGLE_SHEET_ID`: Sheet ID (required even for StreamSource)

### Backend Selection
- `BACKEND_MODE`: single/dual-write/migrate
- `BACKEND_PRIMARY`: googleSheets/streamSource
- `BACKEND_GOOGLE_SHEETS_ENABLED`: true/false
- `BACKEND_STREAMSOURCE_ENABLED`: true/false

### Optional (with defaults)
- Sync intervals (ms): ignore lists (10s), URLs (60s), cities (5m)
- Rate limiting: window (60s), max requests (10)
- Sheet tab/column names (fully customizable)
- Logging: level (info), file (app.log)
- Confirmations: Discord reactions, Twitch replies

## Key Implementation Details

### State Management
- Global state minimal: only backend manager and ignore lists
- Each backend maintains its own state/caches
- Mutex protection for cache updates
- Periodic sync intervals prevent stale data

### Error Handling
- Try-catch blocks around all async operations
- Graceful degradation (one backend failure doesn't stop others)
- Comprehensive logging with Winston
- Uncaught exception handlers

### Performance Considerations
- In-memory caching for all lookups
- Batch operations where possible
- Rate limiting prevents API abuse
- Docker resource limits (512MB RAM, 0.5 CPU)

### Adding New Features

#### New Streaming Platform
1. Add URL pattern to `streamingPatterns` in platformDetector.js
2. Add to `detectPlatform()` function
3. Update `allowedDomains` in urlValidator.js
4. Test URL extraction and normalization

#### New Backend
1. Create new file extending BaseBackend
2. Implement all required methods
3. Add to BackendManager initialization
4. Update configuration handling

#### New Data Field
1. Add column to Google Sheets
2. Add environment variable for column name
3. Update backend's addStream method
4. Update data mapping

## Testing Approach

### Manual Testing
1. Post test URLs in Discord/Twitch
2. Check backend for new entries
3. Verify deduplication works
4. Test ignore lists
5. Verify location parsing

### Backend Testing
- Use provided test scripts (test-sheets.js, test-streamsource.js)
- Enable debug logging: `LOG_LEVEL=debug`
- Check health endpoint: `curl localhost:3000/health`

## Common Issues and Solutions

### Backend Not Saving
1. Check authentication (credentials, tokens)
2. Verify backend is enabled in config
3. Check logs for specific errors
4. Test backend connection independently

### Duplicates Appearing
1. Restart to rebuild cache
2. Check URL normalization
3. Verify backend sync is working
4. Check for backend-specific issues

### Location Not Detected
1. Ensure Known Cities sheet has data
2. Check Google Sheets is enabled (required for cities)
3. Verify city aliases are working
4. Check message format

### Rate Limiting Issues
1. Adjust RATE_LIMIT_MAX_REQUESTS
2. Check user identification working
3. Clear rate limit cache if needed
4. Monitor logs for limit hits

## Docker Deployment

### Container Details
- Base image: node:18-alpine
- Non-root user: node (UID 1000)
- Working directory: /app
- Health check: every 30s
- Auto-restart: unless-stopped

### Volume Mounts
- `.env`: Environment configuration
- `credentials.json`: Google service account
- `logs/`: Application logs
- `package*.json`: Read-only

### Resource Limits
- Memory: 512MB
- CPU: 0.5 cores
- Appropriate for monitoring use case

## Maintenance Tasks

### Regular Maintenance
1. Monitor log file size
2. Update known cities as needed
3. Review ignore lists
4. Check API rate limits
5. Update dependencies

### Backup Considerations
- Google Sheets: Automatic versioning
- StreamSource: Implement export if needed
- Configuration: Backup .env file
- Logs: Rotate regularly

### Monitoring
- Application logs: Winston to file
- Docker logs: `docker compose logs`
- Health endpoint: HTTP health check
- Backend-specific monitoring

## Security Considerations

1. **Credentials**: Never commit .env or credentials.json
2. **Tokens**: Rotate Discord token if exposed
3. **Rate Limiting**: Prevents abuse
4. **URL Validation**: Blocks malicious URLs
5. **Input Limits**: Message length restrictions
6. **Docker Security**: Non-root user, read-only mounts

## Future Enhancements

### Potential Improvements
1. Web dashboard for monitoring
2. More streaming platforms
3. Advanced location parsing
4. Stream status checking
5. Webhook notifications
6. Database backend option
7. Admin commands
8. Analytics and reporting

### StreamSource API Gaps
Currently missing (use Google Sheets for these):
- Ignore list management
- Known cities management
- Bulk export without feature flag

Monitor StreamSource API updates for new features.

## Important Notes

- Always validate environment variables on changes
- Test backend changes in dual-write mode first
- Keep at least one backend enabled
- Monitor rate limits for both Discord and backends
- Regular backups recommended for production use