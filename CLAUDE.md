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

This is a Node.js monitoring application that watches Twitch chat and Discord channels for livestream links, verifies if they're live, and records them to a Google Sheet.

### Core Components

1. **Message Monitoring** (index.js:295-364)
   - Discord.js client monitors specified Discord channel for messages
   - TMI.js client monitors specified Twitch channel chat
   - Both extract URLs using regex patterns for major streaming platforms
   - Implements rate limiting per user to prevent spam
   - Processes URLs concurrently with configurable limits

2. **URL Processing Pipeline** (index.js:259-293)
   - Validates URLs for security (lib/urlValidator.js)
   - Normalizes URLs to ensure proper protocol
   - Detects platform (Twitch, YouTube, TikTok, Kick, Facebook)
   - Uses browser pool to check if stream is actually live
   - Records live streams to Google Sheets

3. **Live Detection** (index.js:128-154, lib/liveChecker.js)
   - Uses browser pool with reusable Chromium instances
   - Platform-specific selectors to detect live status:
     - Twitch: `[data-a-target="stream-indicator"]`
     - YouTube: `.ytp-live-badge`
     - TikTok: Checks for viewer icon or `"isLiveBroadcast":true` in HTML
     - Kick: `.stream-status-live`
     - Facebook: `[aria-label*="LIVE"]`

4. **Google Sheets Integration** (index.js:157-197)
   - Uses service account authentication via configurable path
   - Appends rows with predefined column structure
   - Reads ignore lists from three separate tabs:
     - "Twitch User Ignorelist" - usernames to ignore from Twitch
     - "Discord User Ignorelist" - usernames to ignore from Discord  
     - "URL Ignorelist" - URLs to ignore from both platforms

5. **Ignore List System** (index.js:79-134)
   - Fetches ignore lists from Google Sheets on startup
   - Syncs periodically based on IGNORE_LIST_SYNC_INTERVAL
   - Normalizes values (trim whitespace, lowercase usernames, normalize URLs)
   - Filters messages before URL extraction and processing
   - Handles partial failures gracefully

6. **Performance & Security Features**
   - **Browser Pool** (lib/browserPool.js): Reuses browser instances for efficiency
   - **Rate Limiting** (lib/rateLimiter.js): Prevents spam abuse
   - **URL Validation** (lib/urlValidator.js): Blocks malicious URLs
   - **Concurrent Processing**: Uses p-limit for controlled concurrency
   - **Health Checks**: Docker health monitoring

### Configuration

All configuration is managed through environment variables:
- Discord bot token and channel ID
- Twitch channel name (without #)
- Google Sheet ID
- Optional: check interval and concurrent check limits
- Optional: ignore list sync interval (default: 10 seconds)

### Docker Setup

The application runs in a Docker container based on Microsoft's Playwright image, which includes all browser dependencies. The docker-compose.yml mounts local files as read-only volumes and sets resource limits (2GB RAM, 1 CPU).

### Key Design Decisions

1. **Playwright for Live Detection**: More reliable than API calls, works across all platforms
2. **Browser Pool Architecture**: Reuses browser instances instead of creating new ones for each check
3. **Concurrent Check Limiting**: Uses p-limit to control concurrent operations
4. **Rate Limiting**: Prevents spam abuse with configurable per-user limits
5. **Platform-Agnostic URL Extraction**: Single regex pattern array handles all platforms
6. **Modular Design**: Separated concerns into lib/ modules for maintainability
7. **Security First**: URL validation, no SYS_ADMIN in Docker, runs as non-root user
8. **Structured Logging**: Winston logger with file and console output
9. **Graceful Shutdown**: Proper cleanup of all resources including browser pool

### Adding New Platforms

To support additional streaming platforms:
1. Add URL pattern to `streamingPatterns` array in lib/platformDetector.js
2. Add platform detection in `detectPlatform()` function in lib/platformDetector.js
3. Add live detection logic in `checkLiveStatus()` switch statement in lib/liveChecker.js
4. Update URL validation in lib/urlValidator.js to include the new domain