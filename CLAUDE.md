# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm install` - Install dependencies
- `npm start` - Run the application
- `npm run dev` - Run with nodemon for auto-restart on changes
- `npx playwright install chromium` - Install Playwright browsers (required for local development)

### Docker Deployment
- `docker-compose up -d` - Build and run the application in detached mode
- `docker-compose logs -f` - View live logs
- `docker-compose down` - Stop the application
- `docker-compose build --no-cache` - Rebuild the Docker image

## Architecture

This is a Node.js monitoring application that watches Twitch chat and Discord channels for livestream links and records new ones to a Google Sheet.

### Core Components

1. **Message Monitoring** (index.js:272-364)
   - Discord.js client monitors specified Discord channel for messages
   - TMI.js client monitors specified Twitch channel chat
   - Both extract URLs using regex patterns for major streaming platforms
   - Implements rate limiting per user to prevent spam
   - Sends confirmation feedback (Discord reaction, Twitch reply) when URLs are added

2. **URL Processing Pipeline** (index.js:234-269)
   - Validates URLs for security (lib/urlValidator.js)
   - Normalizes URLs to ensure proper protocol
   - Checks if URL already exists in Google Sheet
   - Detects platform (Twitch, YouTube, TikTok, Kick, Facebook)
   - Adds new URLs to Google Sheets
   - Returns success/failure for confirmation feedback

3. **Google Sheets Integration** (index.js:63-231)
   - Uses service account authentication via configurable path
   - Dynamic column mapping - reads headers and maps by name
   - Configurable tab names for all sheets
   - Reads and caches existing URLs from configurable "Livestreams" tab
   - Reads ignore lists from three configurable tabs
   - All column names are configurable via environment variables

4. **Deduplication System** (index.js:145-189)
   - Fetches existing URLs from sheet on startup
   - Uses dynamic column mapping to find Link column
   - Maintains in-memory cache of existing URLs
   - Syncs periodically based on EXISTING_URLS_SYNC_INTERVAL
   - Prevents duplicate entries in the sheet

5. **Ignore List System** (index.js:63-118)
   - Fetches ignore lists from Google Sheets on startup
   - Syncs periodically based on IGNORE_LIST_SYNC_INTERVAL
   - Normalizes values (trim whitespace, lowercase usernames, normalize URLs)
   - Filters messages before URL extraction and processing
   - Handles partial failures gracefully

6. **Configuration System** (config.js)
   - All hardcoded values extracted to environment variables
   - Sheet tab names, column names, status values all configurable
   - Timezone, log level, and file paths configurable
   - Confirmation behaviors can be enabled/disabled
   - Validation for numeric environment variables

7. **Performance & Security Features**
   - **Rate Limiting** (lib/rateLimiter.js): Prevents spam abuse
   - **URL Validation** (lib/urlValidator.js): Blocks malicious URLs
   - **Health Checks**: Docker health monitoring
   - **Graceful Shutdown**: Handles multiple signals properly
   - **Resource Limits**: Docker configured with appropriate memory/CPU limits

### Configuration

All configuration is managed through environment variables:
- Discord bot token and channel ID
- Twitch channel name (without #)
- Google Sheet ID
- Optional: ignore list sync interval (default: 10 seconds)
- Optional: existing URLs sync interval (default: 60 seconds)

### Docker Setup

The application runs in a Docker container based on Node.js Alpine image for a lightweight deployment. The docker-compose.yml mounts local files as read-only volumes and sets resource limits (512MB RAM, 0.5 CPU).

### Key Design Decisions

1. **Simplified Architecture**: No browser automation - just collect and record URLs
2. **Dynamic Column Mapping**: Reads sheet headers to handle column reordering
3. **Comprehensive Configuration**: All values configurable via environment variables
4. **Deduplication First**: Checks existing URLs before adding to prevent duplicates
5. **In-Memory Caching**: Maintains caches for performance (URLs, column mapping)
6. **User Feedback**: Context-appropriate confirmations (Discord reactions, Twitch replies)
7. **Rate Limiting**: Prevents spam abuse with configurable per-user limits
8. **Platform-Agnostic URL Extraction**: Single regex pattern array handles all platforms
9. **Modular Design**: Separated concerns into lib/ modules for maintainability
10. **Security First**: URL validation, runs as non-root user in Docker
11. **Structured Logging**: Winston logger with configurable level and file output
12. **Graceful Shutdown**: Handles SIGINT, SIGTERM, SIGHUP, uncaught exceptions

### Adding New Platforms

To support additional streaming platforms:
1. Add URL pattern to `streamingPatterns` array in lib/platformDetector.js
2. Add platform detection in `detectPlatform()` function in lib/platformDetector.js
3. Update URL validation in lib/urlValidator.js to include the new domain