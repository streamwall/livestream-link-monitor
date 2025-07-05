# Environment Variables Reference

This document provides a complete reference for all environment variables used in the Livestream Link Monitor.

## Required Variables

These variables MUST be set for the application to function:

### Core Services

| Variable | Description | Example | Notes |
|----------|-------------|---------|-------|
| `DISCORD_TOKEN` | Discord bot token | `NzI3Nzk...jpqY8w` | Get from Discord Developer Portal |
| `DISCORD_CHANNEL_ID` | Discord channel to monitor | `727480586834411591` | Right-click channel → Copy ID |
| `TWITCH_CHANNEL` | Twitch channel to monitor | `woke` | Channel name WITHOUT the # |

### Backend (at least one required)

| Variable | Description | Example | Default |
|----------|-------------|---------|---------|
| `GOOGLE_SHEET_ID` | Google Sheet ID from URL | `1amkWpZu5h...pvKo` | Required if using Google Sheets |
| `STREAMSOURCE_EMAIL` | StreamSource account email | `user@example.com` | Required if using StreamSource |
| `STREAMSOURCE_PASSWORD` | StreamSource account password | `secure_password` | Required if using StreamSource |

## Optional Variables

### Google Sheets Configuration

| Variable | Description | Default | Notes |
|----------|-------------|---------|-------|
| `GOOGLE_CREDENTIALS_PATH` | Path to service account JSON | `./credentials.json` | Relative or absolute path |

### Backend Selection

| Variable | Description | Options | Default |
|----------|-------------|---------|---------|
| `BACKEND_MODE` | How backends operate | `single`, `dual-write`, `migrate` | `single` |
| `BACKEND_PRIMARY` | Primary backend to use | `googleSheets`, `streamSource` | `googleSheets` |
| `BACKEND_GOOGLE_SHEETS_ENABLED` | Enable Google Sheets backend | `true`, `false` | `true` |
| `BACKEND_STREAMSOURCE_ENABLED` | Enable StreamSource backend | `true`, `false` | `false` |

### StreamSource Configuration

| Variable | Description | Default | Notes |
|----------|-------------|---------|-------|
| `STREAMSOURCE_API_URL` | StreamSource API endpoint | `https://api.streamsource.com` | Change for self-hosted |

### Sync Intervals

All intervals are in milliseconds.

| Variable | Description | Default | Minimum |
|----------|-------------|---------|---------|
| `IGNORE_LIST_SYNC_INTERVAL` | How often to sync ignore lists | `10000` (10 sec) | `1000` |
| `EXISTING_URLS_SYNC_INTERVAL` | How often to sync existing URLs | `60000` (1 min) | `1000` |
| `KNOWN_CITIES_SYNC_INTERVAL` | How often to sync known cities | `300000` (5 min) | `1000` |

### Rate Limiting

| Variable | Description | Default | Notes |
|----------|-------------|---------|-------|
| `RATE_LIMIT_WINDOW_MS` | Rate limit time window | `60000` (1 min) | Per-user rate limiting |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `10` | Prevents spam |

### Google Sheets Tab Names

Customize if your sheet uses different tab names.

| Variable | Description | Default |
|----------|-------------|---------|
| `SHEET_TAB_LIVESTREAMS` | Main streams tab | `Livesheet` |
| `SHEET_TAB_TWITCH_IGNORE` | Twitch ignore list tab | `Twitch User Ignorelist` |
| `SHEET_TAB_DISCORD_IGNORE` | Discord ignore list tab | `Discord User Ignorelist` |
| `SHEET_TAB_URL_IGNORE` | URL ignore list tab | `URL Ignorelist` |
| `SHEET_TAB_KNOWN_CITIES` | Known cities tab | `Known Cities` |

### Google Sheets Column Names

Customize if your sheet uses different column headers.

| Variable | Description | Default |
|----------|-------------|---------|
| `COLUMN_SOURCE` | Source/username column | `Source` |
| `COLUMN_PLATFORM` | Platform column | `Platform` |
| `COLUMN_STATUS` | Status column | `Status` |
| `COLUMN_LINK` | URL/link column | `Link` |
| `COLUMN_ADDED_DATE` | Date added column | `Added Date` |
| `COLUMN_POSTED_BY` | Posted by column | `Posted By` |
| `COLUMN_CITY` | City column | `City` |
| `COLUMN_STATE` | State column | `State` |

### Status Values

| Variable | Description | Default |
|----------|-------------|---------|
| `STATUS_NEW_LINK` | Status for new links | `Live` |

### Logging Configuration

| Variable | Description | Options | Default |
|----------|-------------|---------|---------|
| `LOG_LEVEL` | Logging verbosity | `error`, `warn`, `info`, `debug` | `info` |
| `LOG_FILE` | Log file location | Any file path | `app.log` |

### Other Configuration

| Variable | Description | Default | Notes |
|----------|-------------|---------|-------|
| `TIMEZONE` | Timezone for timestamps | `America/Los_Angeles` | Any valid timezone |
| `DISCORD_CONFIRM_REACTION` | Add Discord reactions | `true` | Set to `false` to disable |
| `TWITCH_CONFIRM_REPLY` | Send Twitch replies | `true` | Set to `false` to disable |

## Configuration Examples

### Minimal Configuration (Google Sheets)
```bash
# Required
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CHANNEL_ID=your_channel_id
TWITCH_CHANNEL=channel_name
GOOGLE_SHEET_ID=your_sheet_id
```

### Minimal Configuration (StreamSource)
```bash
# Required
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CHANNEL_ID=your_channel_id
TWITCH_CHANNEL=channel_name
GOOGLE_SHEET_ID=placeholder  # Still required but not used

# Backend Configuration
BACKEND_PRIMARY=streamSource
BACKEND_GOOGLE_SHEETS_ENABLED=false
BACKEND_STREAMSOURCE_ENABLED=true
STREAMSOURCE_EMAIL=your@email.com
STREAMSOURCE_PASSWORD=your_password
```

### Full Configuration Example
```bash
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CHANNEL_ID=your_channel_id

# Twitch Configuration
TWITCH_CHANNEL=channel_name

# Google Sheets Configuration
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_CREDENTIALS_PATH=./credentials.json

# Backend Configuration
BACKEND_MODE=dual-write
BACKEND_PRIMARY=googleSheets
BACKEND_GOOGLE_SHEETS_ENABLED=true
BACKEND_STREAMSOURCE_ENABLED=true

# StreamSource Configuration
STREAMSOURCE_API_URL=https://api.streamsource.com
STREAMSOURCE_EMAIL=your@email.com
STREAMSOURCE_PASSWORD=your_password

# Sync Intervals
IGNORE_LIST_SYNC_INTERVAL=30000      # 30 seconds
EXISTING_URLS_SYNC_INTERVAL=120000   # 2 minutes
KNOWN_CITIES_SYNC_INTERVAL=600000    # 10 minutes

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=5            # Stricter limit

# Custom Sheet Names
SHEET_TAB_LIVESTREAMS=Streams
SHEET_TAB_KNOWN_CITIES=Cities

# Custom Column Names
COLUMN_SOURCE=Streamer
COLUMN_LINK=URL

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/app.log

# Other
TIMEZONE=America/New_York
DISCORD_CONFIRM_REACTION=false      # Disable reactions
TWITCH_CONFIRM_REPLY=true
```

## Environment Variable Validation

The application validates environment variables on startup:

1. **Required variables** - Application exits if missing
2. **Numeric variables** - Validated and fallback to defaults if invalid
3. **Boolean variables** - Checked for 'false' string (defaults to true)
4. **File paths** - Checked for existence (Google credentials)

## Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Use strong passwords** for StreamSource
3. **Rotate Discord tokens** if exposed
4. **Restrict Google Sheet permissions** to only what's needed
5. **Use environment-specific files**:
   - `.env.development`
   - `.env.production`
   - `.env.test`

## Docker Environment Variables

When using Docker, pass environment variables via:

1. **docker-compose.yml**:
   ```yaml
   environment:
     - DISCORD_TOKEN=${DISCORD_TOKEN}
     - DISCORD_CHANNEL_ID=${DISCORD_CHANNEL_ID}
   ```

2. **Docker run**:
   ```bash
   docker run -e DISCORD_TOKEN=token -e DISCORD_CHANNEL_ID=123 ...
   ```

3. **env_file**:
   ```yaml
   env_file:
     - .env
   ```

## Troubleshooting

### Variable Not Working?

1. **Check spelling** - Variable names are case-sensitive
2. **Check quotes** - Some shells require quotes for special characters
3. **Check precedence** - Command line > .env file > defaults
4. **Enable debug logging**:
   ```bash
   LOG_LEVEL=debug
   ```

### Common Issues

- **Boolean values**: Use exact string 'false' to disable (not 0 or no)
- **Numeric values**: Must be valid integers, no decimals
- **File paths**: Can be relative or absolute
- **URLs**: Include protocol (https://)

## Removed Variables

The following variables were removed from earlier versions:
- `CHECK_INTERVAL` - No longer used
- `MAX_CONCURRENT_CHECKS` - No longer used

If you have these in your .env file, they can be safely removed.