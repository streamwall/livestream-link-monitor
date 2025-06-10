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
- Uses Playwright to verify if streams are actually live
- Automatically adds live streams to Google Sheets
- Dockerized for easy deployment
- Comprehensive logging

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

- `DISCORD_TOKEN`: Your Discord bot token
- `DISCORD_CHANNEL_ID`: The Discord channel ID to monitor
- `TWITCH_CHANNEL`: The Twitch channel name to monitor (without #)
- `GOOGLE_SHEET_ID`: Your Google Sheet ID
- `CHECK_INTERVAL`: How often to re-check URLs (in milliseconds)
- `MAX_CONCURRENT_CHECKS`: Maximum concurrent browser instances

## Development

To run locally without Docker:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

3. Run the application:
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

3. **Playwright issues**
   - The Docker image includes all necessary dependencies
   - If running locally, ensure Chromium is installed
   - Check memory limits if browser crashes occur

## Adding New Platforms

To add support for new streaming platforms:

1. Add URL pattern to `streamingPatterns` array
2. Add platform detection in `detectPlatform()`
3. Add live detection logic in `isLiveStream()`

## License

MIT