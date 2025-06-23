# Live Stream Link Monitor

A Node.js application that monitors Twitch chat and Discord channels for live streaming links and automatically adds them to StreamSource API.

## Features

- Monitors Twitch channel chat
- Monitors Discord channel messages
- Detects links from multiple streaming platforms:
  - Twitch
  - TikTok
  - YouTube
  - Kick.com
  - Facebook
- Automatically adds new streaming URLs to StreamSource API
- Location parsing - extracts city/state from messages
- Deduplication - checks if URLs already exist in StreamSource before adding
- Configurable ignore lists for users and URLs synced from Google Sheets
- Automatic streamer creation based on platform usernames
- Rate limiting to prevent spam abuse
- Concurrent URL processing with configurable limits
- URL validation for security
- Dockerized for easy deployment
- Comprehensive logging with Winston
- Health checks for container monitoring

## Prerequisites

1. **Discord Bot Token**
   - Create a Discord application at https://discord.com/developers/applications
   - Create a bot and get its token
   - Invite the bot to your server with message read permissions

2. **StreamSource API**
   - Ensure StreamSource is running on your host machine (default: http://localhost:3000)
   - Create a user account with appropriate permissions
   - Have the username and password ready for API authentication

3. **Google Service Account** (for ignore lists and known cities)
   - Create a project in Google Cloud Console
   - Enable Google Sheets API
   - Create a service account and download the credentials JSON
   - Share your Google Sheet with the service account email

4. **Google Sheet** (for configuration data only)
   - Create a Google Sheet with the following tabs:
     - **"Twitch User Ignorelist"** - Column A header: "Username"
     - **"Discord User Ignorelist"** - Column A header: "Username"
     - **"URL Ignorelist"** - Column A header: "URL"
     - **"Known Cities"** - Column A header: "City", Column B header: "State"
   - Get the Sheet ID from the URL

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository>
   cd livestream-monitor
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Add Google credentials**
   - Save your Google service account credentials as `credentials.json` in the project root

4. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## Configuration

Edit the `.env` file with your configuration:

### Required Configuration

- `DISCORD_TOKEN`: Your Discord bot token
- `DISCORD_CHANNEL_ID`: The Discord channel ID to monitor
- `TWITCH_CHANNEL`: The Twitch channel name to monitor (without #)
- `GOOGLE_SHEET_ID`: Your Google Sheet ID (for ignore lists and known cities)
- `STREAMSOURCE_USERNAME`: StreamSource API username
- `STREAMSOURCE_PASSWORD`: StreamSource API password

### Optional Configuration

**API Configuration**
- `STREAMSOURCE_API_URL`: StreamSource API base URL (default: http://host.docker.internal:3000 for Docker, http://localhost:3000 for local development)

**File Paths**
- `GOOGLE_CREDENTIALS_PATH`: Path to Google service account credentials (default: ./credentials.json)

**Sync Intervals**
- `IGNORE_LIST_SYNC_INTERVAL`: How often to sync ignore lists from Google Sheets (default: 10000ms)
- `KNOWN_CITIES_SYNC_INTERVAL`: How often to sync known cities from Google Sheets (default: 300000ms / 5 minutes)

**Rate Limiting**
- `RATE_LIMIT_WINDOW_MS`: Rate limit time window (default: 60000ms)
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per user per window (default: 10)

**Sheet Tab Names** (for configuration data)
- `SHEET_TAB_TWITCH_IGNORE`: Twitch ignore list tab (default: "Twitch User Ignorelist")
- `SHEET_TAB_DISCORD_IGNORE`: Discord ignore list tab (default: "Discord User Ignorelist")
- `SHEET_TAB_URL_IGNORE`: URL ignore list tab (default: "URL Ignorelist")
- `SHEET_TAB_KNOWN_CITIES`: Known cities tab (default: "Known Cities")

**Other Settings**
- `STATUS_NEW_LINK`: Status value for new links (default: "Live")
- `TIMEZONE`: Timezone for timestamps (default: "America/Los_Angeles")
- `LOG_LEVEL`: Logging level (default: "info", options: error, warn, info, debug)

**Confirmation Settings**
- `DISCORD_CONFIRM_REACTION`: Add ✅ reaction to Discord messages (default: true, set to "false" to disable)
- `TWITCH_CONFIRM_REPLY`: Reply with ✅ in Twitch chat (default: true, set to "false" to disable)

## Development

To run locally without Docker:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the application:
   ```bash
   npm start
   ```

## Monitoring

- Logs are stored in the `logs` directory
- View live logs: `docker-compose logs -f`
- The application will automatically restart on crashes

## Troubleshooting

1. **Bot not detecting messages**
   - Ensure the bot has proper permissions in Discord
   - Check that the channel IDs are correct
   - Verify the bot is online in Discord

2. **StreamSource API not working**
   - Verify StreamSource is running at the configured URL
   - Check that the API credentials are correct
   - Review logs for authentication errors
   - Ensure the user account has appropriate permissions

3. **Application issues**
   - Check logs for API rate limiting from StreamSource
   - Verify network connectivity to Discord, Twitch, and StreamSource
   - Ensure Google Sheets access for ignore lists is working

## Ignore Lists

The application supports ignore lists for filtering out specific users and URLs:

- **Twitch User Ignorelist**: Usernames listed here will have their Twitch messages ignored
- **Discord User Ignorelist**: Usernames listed here will have their Discord messages ignored
- **URL Ignorelist**: URLs listed here will be ignored from both platforms

Add entries to the respective Google Sheets tabs. The lists are automatically synced at the configured interval.

## Location Parsing

The application automatically extracts location information from messages:

- **Known Cities Tab**: Populate the "Known Cities" tab in Google Sheets with city names in column A and state names in column B
- **City Aliases**: Common abbreviations are automatically handled (e.g., NYC → New York City, LA → Los Angeles)
- **Case-Insensitive**: Matching works regardless of capitalization
- **Pattern Matching**: Detects patterns like "city, state" and "city ST" (state abbreviations)
- **Stream Notes**: Detected city and state are added as notes to the stream in StreamSource

## StreamSource Integration

The application integrates with StreamSource API to store and manage streams:

- **Automatic Streamer Creation**: When a username is extracted from the URL, a streamer is automatically created or found
- **Stream Deduplication**: Checks StreamSource to avoid creating duplicate streams
- **Location as Notes**: City/state information is added as system notes to the stream
- **Posted By Info**: The Discord/Twitch username who posted the link is recorded in notes
- **Platform Detection**: Automatically detects and tags the streaming platform

## Testing StreamSource Integration

A test script is provided to verify StreamSource connectivity:

```bash
node test-streamsource.js
```

This will test:
- API authentication
- Stream creation
- Duplicate detection
- Streamer creation
- Stream retrieval

## Docker Networking

When running the livestream monitor in Docker, it needs to connect to StreamSource running on your host machine. Docker containers can't access `localhost` or `0.0.0.0` on the host directly.

### Solution: Use Docker's host gateway

Set the StreamSource URL in your `.env` file:

```
STREAMSOURCE_API_URL=http://host.docker.internal:3000
```

This special hostname `host.docker.internal` resolves to the host machine from within Docker containers on macOS and Windows.

### Alternative Solutions:

1. **Run both services in Docker Compose**: Add StreamSource to the same docker-compose.yml
2. **Use host network mode** (Linux only): Add `network_mode: host` to docker-compose.yml
3. **Use your machine's IP**: Replace `localhost` with your actual IP address

## Adding New Platforms

To add support for new streaming platforms:

1. Add URL pattern to `streamingPatterns` array in `lib/platformDetector.js`
2. Add platform detection in `detectPlatform()` function in `lib/platformDetector.js`
3. Update URL validation in `lib/urlValidator.js` to include the new domain

## License

MIT