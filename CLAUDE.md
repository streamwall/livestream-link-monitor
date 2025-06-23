# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Architecture

This is a Node.js monitoring application that watches Twitch chat and Discord channels for livestream links, extracts location information from messages, and sends new links with their location data to the StreamSource API. Google Sheets is still used for configuration data (ignore lists and known cities).

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
   - Checks if URL already exists in StreamSource via API
   - Detects platform (Twitch, YouTube, TikTok, Kick, Facebook)
   - Parses location (city/state) from message content (lib/locationParser.js)
   - Creates stream in StreamSource with automatic streamer association
   - Adds location and posted-by info as notes in StreamSource
   - Returns success/failure for confirmation feedback

3. **StreamSource API Integration** (lib/streamSourceClient.js)
   - JWT-based authentication with automatic token refresh
   - Creates streams with platform, URL, and status information
   - Automatic streamer creation/association based on URL usernames
   - Adds location and posted-by information as system notes
   - Handles duplicate detection and error cases
   - Caches streamers to reduce API calls

4. **Google Sheets Integration** (index.js:63-231)
   - Uses service account authentication via configurable path
   - Reads ignore lists from three configurable tabs
   - Reads known cities for location parsing
   - No longer stores stream data (moved to StreamSource)

5. **Deduplication System** (lib/streamSourceClient.js)
   - Checks StreamSource API for existing streams
   - Uses URL-based search to detect duplicates
   - Returns appropriate response for duplicate detection
   - No longer maintains local cache (uses API directly)

6. **Ignore List System** (index.js:63-118)
   - Fetches ignore lists from Google Sheets on startup
   - Syncs periodically based on IGNORE_LIST_SYNC_INTERVAL
   - Normalizes values (trim whitespace, lowercase usernames, normalize URLs)
   - Filters messages before URL extraction and processing
   - Handles partial failures gracefully

7. **Configuration System** (config.js)
   - All hardcoded values extracted to environment variables
   - Sheet tab names, column names, status values all configurable
   - Timezone, log level, and file paths configurable
   - Confirmation behaviors can be enabled/disabled
   - Validation for numeric environment variables

8. **Location Parsing System** (lib/locationParser.js)
   - Fetches known cities from "Known Cities" tab in Google Sheets
   - Caches city/state data with normalized lookups
   - Supports common city aliases (NYC -> New York City, LA -> Los Angeles, etc.)
   - Case-insensitive matching with multiple parsing strategies
   - Handles "city, state" patterns and state abbreviations
   - Syncs with Google Sheets periodically

9. **Performance & Security Features**
   - **Rate Limiting** (lib/rateLimiter.js): Prevents spam abuse
   - **URL Validation** (lib/urlValidator.js): Blocks malicious URLs
   - **Health Checks**: Docker health monitoring
   - **Graceful Shutdown**: Handles multiple signals properly
   - **Resource Limits**: Docker configured with appropriate memory/CPU limits

### Configuration

All configuration is managed through environment variables:
- Discord bot token and channel ID
- Twitch channel name (without #)
- StreamSource API URL, username, and password
- Google Sheet ID (for configuration data only)
- Optional: ignore list sync interval (default: 10 seconds)
- Optional: known cities sync interval (default: 5 minutes)
- Sheet tab names (Known Cities, ignore lists)

### Docker Setup

The application runs in a Docker container based on Node.js Alpine image for a lightweight deployment. The docker-compose.yml mounts local files as read-only volumes and sets resource limits (512MB RAM, 0.5 CPU).

### Key Design Decisions

1. **API-First Architecture**: Uses StreamSource API for data storage instead of Google Sheets
2. **Simplified Architecture**: No browser automation - just collect and send URLs to API
3. **Comprehensive Configuration**: All values configurable via environment variables
4. **Deduplication via API**: Checks StreamSource before adding to prevent duplicates
5. **Automatic Streamer Management**: Creates/finds streamers based on URL usernames
6. **Hybrid Storage**: StreamSource for streams, Google Sheets for configuration
7. **User Feedback**: Context-appropriate confirmations (Discord reactions, Twitch replies)
8. **Rate Limiting**: Prevents spam abuse with configurable per-user limits
9. **Platform-Agnostic URL Extraction**: Single regex pattern array handles all platforms
10. **Location Intelligence**: Extracts city/state from messages using cached known cities
11. **Modular Design**: Separated concerns into lib/ modules for maintainability
12. **Security First**: URL validation, JWT authentication, runs as non-root user in Docker
13. **Structured Logging**: Winston logger with configurable level and file output
14. **Graceful Shutdown**: Handles SIGINT, SIGTERM, SIGHUP, uncaught exceptions

### Adding New Platforms

To support additional streaming platforms:
1. Add URL pattern to `streamingPatterns` array in lib/platformDetector.js
2. Add platform detection in `detectPlatform()` function in lib/platformDetector.js
3. Update URL validation in lib/urlValidator.js to include the new domain