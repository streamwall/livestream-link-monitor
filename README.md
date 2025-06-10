# Live Stream Link Monitor

A Node.js application that monitors Twitch chat and Discord channels for live streaming links and automatically adds them to a Google Sheet.

## Features

- Monitors Twitch channel chat
- Monitors Discord channel messages
- Detects links from multiple streaming platforms:
  - Twitch
  - TikTok
  - YouTube
  - Kick.com
  - Facebook
- Automatically adds new streaming URLs to Google Sheets
- Location parsing - extracts city/state from messages and adds to sheet
- Deduplication - checks if URLs already exist in sheet before adding
- Configurable ignore lists for users and URLs synced from Google Sheets
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

2. **Google Service Account**
   - Create a project in Google Cloud Console
   - Enable Google Sheets API
   - Create a service account and download the credentials JSON
   - Share your Google Sheet with the service account email

3. **Google Sheet**
   - Create a Google Sheet with the following headers in row 1:
     ```
     Source | City | State | Platform | Status | Link | Notes | Title | Added Date | Last Checked (PST) | Last Live (PST) | Embed Link | Posted By | Orientation | Status Link
     ```
   - Create four additional tabs:
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
- `GOOGLE_SHEET_ID`: Your Google Sheet ID

### Optional Configuration

**File Paths**
- `GOOGLE_CREDENTIALS_PATH`: Path to Google service account credentials (default: ./credentials.json)

**Sync Intervals**
- `IGNORE_LIST_SYNC_INTERVAL`: How often to sync ignore lists (default: 10000ms)
- `EXISTING_URLS_SYNC_INTERVAL`: How often to sync existing URLs (default: 60000ms)
- `KNOWN_CITIES_SYNC_INTERVAL`: How often to sync known cities (default: 300000ms / 5 minutes)

**Rate Limiting**
- `RATE_LIMIT_WINDOW_MS`: Rate limit time window (default: 60000ms)
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per user per window (default: 10)

**Sheet Tab Names**
- `SHEET_TAB_LIVESTREAMS`: Main data tab name (default: "Livesheet")
- `SHEET_TAB_TWITCH_IGNORE`: Twitch ignore list tab (default: "Twitch User Ignorelist")
- `SHEET_TAB_DISCORD_IGNORE`: Discord ignore list tab (default: "Discord User Ignorelist")
- `SHEET_TAB_URL_IGNORE`: URL ignore list tab (default: "URL Ignorelist")
- `SHEET_TAB_KNOWN_CITIES`: Known cities tab (default: "Known Cities")

**Column Names**
- `COLUMN_SOURCE`: Source column name (default: "Source")
- `COLUMN_CITY`: City column name (default: "City")
- `COLUMN_STATE`: State column name (default: "State")
- `COLUMN_PLATFORM`: Platform column name (default: "Platform")
- `COLUMN_STATUS`: Status column name (default: "Status")
- `COLUMN_LINK`: Link column name (default: "Link")
- `COLUMN_ADDED_DATE`: Added date column name (default: "Added Date")
- `COLUMN_POSTED_BY`: Posted by column name (default: "Posted By")

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

2. **Google Sheets not updating**
   - Verify the service account has edit access to the sheet
   - Check that the Sheet ID is correct
   - Review logs for authentication errors

3. **Application issues**
   - Check logs for API rate limiting from Google Sheets
   - Ensure the sheet structure matches expected columns
   - Verify network connectivity to Discord and Twitch

## Ignore Lists

The application supports ignore lists for filtering out specific users and URLs:

- **Twitch User Ignorelist**: Usernames listed here will have their Twitch messages ignored
- **Discord User Ignorelist**: Usernames listed here will have their Discord messages ignored
- **URL Ignorelist**: URLs listed here will be ignored from both platforms

Add entries to the respective Google Sheets tabs. The lists are automatically synced at the configured interval.

## Location Parsing

The application automatically extracts location information from messages:

- **Known Cities Tab**: Populate the "Known Cities" tab with city names in column A and state names in column B
- **City Aliases**: Common abbreviations are automatically handled (e.g., NYC → New York City, LA → Los Angeles)
- **Case-Insensitive**: Matching works regardless of capitalization
- **Pattern Matching**: Detects patterns like "city, state" and "city ST" (state abbreviations)
- **Auto-Population**: Detected city and state are added to the respective columns in the main sheet

## Adding New Platforms

To add support for new streaming platforms:

1. Add URL pattern to `streamingPatterns` array in `lib/platformDetector.js`
2. Add platform detection in `detectPlatform()` function in `lib/platformDetector.js`
3. Update URL validation in `lib/urlValidator.js` to include the new domain

## License

MIT