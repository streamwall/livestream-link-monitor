# Livestream Link Monitor Setup Instructions

This guide will help you configure the Livestream Link Monitor for your chosen backend(s).

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Discord Bot Token** - [Create a Discord Application](https://discord.com/developers/applications)
3. **Twitch Channel** - The channel name you want to monitor
4. **Backend Credentials** - Either Google Sheets or StreamSource (or both)

## Initial Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd livestream-link-monitor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your Discord and Twitch settings in `.env`:
   ```bash
   # Discord Configuration
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CHANNEL_ID=your_channel_id
   
   # Twitch Configuration  
   TWITCH_CHANNEL=channel_name_without_hash
   ```

## Backend Configuration Options

### Option 1: Google Sheets Only (Default)

This is the simplest setup and provides full functionality including ignore lists and location parsing.

#### Step 1: Create a Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the service account details
   - Click "Create" and then "Done"
5. Generate a key:
   - Click on the service account you created
   - Go to the "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose JSON format
   - Save the downloaded file as `credentials.json` in your project root

#### Step 2: Set Up Your Google Sheet

1. Create a new Google Sheet
2. Create the following tabs (sheets) with these exact names:
   - `Livesheet` - For storing stream links
   - `Known Cities` - For location parsing
   - `Twitch User Ignorelist` - Users to ignore from Twitch
   - `Discord User Ignorelist` - Users to ignore from Discord  
   - `URL Ignorelist` - URLs to ignore

3. In the `Livesheet` tab, add these headers in row 1:
   ```
   Source | Platform | Status | Link | Added Date | Posted By | City | State
   ```

4. In the `Known Cities` tab, add these headers in row 1:
   ```
   City | State
   ```
   Then add your cities data, for example:
   ```
   New York City | NY
   Los Angeles | CA
   Chicago | IL
   ```

5. In the ignore list tabs, just add usernames or URLs starting from row 2 (one per row)

6. Share the Google Sheet with your service account:
   - Open your `credentials.json` file
   - Find the `client_email` field
   - In Google Sheets, click "Share"
   - Add the service account email with "Editor" permissions

#### Step 3: Configure Environment Variables

Add to your `.env` file:
```bash
# Google Sheets Configuration
GOOGLE_SHEET_ID=your_sheet_id_from_url
GOOGLE_CREDENTIALS_PATH=./credentials.json

# Backend Configuration (these are defaults, optional)
BACKEND_MODE=single
BACKEND_PRIMARY=googleSheets
BACKEND_GOOGLE_SHEETS_ENABLED=true
BACKEND_STREAMSOURCE_ENABLED=false
```

The Sheet ID can be found in your Google Sheets URL:
`https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit`

### Option 2: StreamSource Only

StreamSource provides a dedicated API for stream management but currently lacks ignore list and location features.

#### Step 1: Create StreamSource Account

1. Sign up for a StreamSource account at their API endpoint
2. Note your email and password for authentication

#### Step 2: Configure Environment Variables

Add to your `.env` file:
```bash
# StreamSource Configuration
STREAMSOURCE_API_URL=https://api.streamsource.com
STREAMSOURCE_EMAIL=your_email@example.com
STREAMSOURCE_PASSWORD=your_password

# Backend Configuration
BACKEND_MODE=single
BACKEND_PRIMARY=streamSource
BACKEND_GOOGLE_SHEETS_ENABLED=false
BACKEND_STREAMSOURCE_ENABLED=true

# Note: You'll need to disable Google Sheets
GOOGLE_SHEET_ID=placeholder
```

**⚠️ Limitations:**
- No ignore list support (all messages will be processed)
- No location parsing (city/state will be empty)
- Consider using dual-backend mode to maintain these features

### Option 3: Dual Backend Mode

Run both backends simultaneously for maximum functionality.

#### Step 1: Set Up Both Backends

Follow the setup instructions for both Google Sheets and StreamSource above.

#### Step 2: Configure for Dual-Write Mode

Add to your `.env` file:
```bash
# Google Sheets Configuration
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_CREDENTIALS_PATH=./credentials.json

# StreamSource Configuration
STREAMSOURCE_API_URL=https://api.streamsource.com
STREAMSOURCE_EMAIL=your_email@example.com
STREAMSOURCE_PASSWORD=your_password

# Backend Configuration for Dual Mode
BACKEND_MODE=dual-write
BACKEND_PRIMARY=googleSheets  # or streamSource
BACKEND_GOOGLE_SHEETS_ENABLED=true
BACKEND_STREAMSOURCE_ENABLED=true
```

In this mode:
- All new streams are written to both backends
- Deduplication checks both backends
- Ignore lists and cities come from Google Sheets
- Primary backend is used for conflict resolution

### Option 4: Migration Mode

Use this when transitioning from one backend to another.

```bash
# Backend Configuration for Migration
BACKEND_MODE=migrate
BACKEND_PRIMARY=googleSheets  # your current backend
BACKEND_GOOGLE_SHEETS_ENABLED=true
BACKEND_STREAMSOURCE_ENABLED=true
```

This mode:
- Writes to the new backend first, then the old
- Helps identify any issues before fully switching
- Maintains data in both places during transition

## Additional Configuration

### Optional Settings

```bash
# Sync Intervals (milliseconds)
IGNORE_LIST_SYNC_INTERVAL=10000      # Default: 10 seconds
EXISTING_URLS_SYNC_INTERVAL=60000    # Default: 60 seconds  
KNOWN_CITIES_SYNC_INTERVAL=300000    # Default: 5 minutes

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000           # Default: 1 minute
RATE_LIMIT_MAX_REQUESTS=10           # Default: 10 requests per window

# Confirmation Behavior
DISCORD_CONFIRM_REACTION=true        # Send Discord reactions
TWITCH_CONFIRM_REPLY=true           # Send Twitch replies

# Logging
LOG_LEVEL=info                      # Options: error, warn, info, debug
LOG_FILE=app.log                    # Log file location
```

### Custom Sheet Configuration

If your Google Sheet uses different column names or tab names:

```bash
# Sheet Tab Names
SHEET_TAB_LIVESTREAMS=Livesheet
SHEET_TAB_TWITCH_IGNORE=Twitch User Ignorelist
SHEET_TAB_DISCORD_IGNORE=Discord User Ignorelist
SHEET_TAB_URL_IGNORE=URL Ignorelist
SHEET_TAB_KNOWN_CITIES=Known Cities

# Column Names
COLUMN_SOURCE=Source
COLUMN_PLATFORM=Platform
COLUMN_STATUS=Status
COLUMN_LINK=Link
COLUMN_ADDED_DATE=Added Date
COLUMN_POSTED_BY=Posted By
COLUMN_CITY=City
COLUMN_STATE=State

# Status Values
STATUS_NEW_LINK=Live
```

## Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Docker Deployment
```bash
docker compose up -d
```

## Verifying Your Setup

1. **Check the logs** for successful initialization:
   ```
   Backend initialized
   Discord bot connected
   Twitch bot connected
   ```

2. **Test with a stream link** in your monitored channels:
   - Post a Twitch/YouTube/TikTok link in Discord or Twitch chat
   - Check for confirmation (reaction/reply)
   - Verify the link appears in your backend

3. **Common Issues:**
   - **Google Sheets**: Ensure service account has editor permissions
   - **StreamSource**: Check authentication credentials
   - **Discord**: Verify bot has message read permissions
   - **Twitch**: Ensure channel name is without the # symbol

## Troubleshooting

### Google Sheets Issues
- **"Credentials file not found"**: Ensure `credentials.json` exists in the project root
- **"Permission denied"**: Share the sheet with your service account email
- **"Column not found"**: Check that your sheet headers match the configuration

### StreamSource Issues
- **"Authentication failed"**: Verify email/password are correct
- **"Rate limited"**: The backend implements automatic retry with backoff
- **"404 Not Found"**: Check the API URL is correct

### General Issues
- **No messages detected**: Check bot permissions in Discord/Twitch
- **Duplicate entries**: Clear the sheet and restart to rebuild cache
- **Location not detected**: Ensure Known Cities sheet has data

## Security Notes

1. **Never commit your `.env` file** - it contains sensitive credentials
2. **Keep your `credentials.json` secure** - add it to `.gitignore`
3. **Use strong passwords** for StreamSource
4. **Rotate tokens regularly** for enhanced security
5. **Limit bot permissions** to only what's necessary

## Next Steps

- Monitor the logs for any errors
- Set up ignore lists to filter unwanted content
- Populate the Known Cities sheet for better location detection
- Consider setting up monitoring/alerts for the application
- Review rate limits based on your channel activity