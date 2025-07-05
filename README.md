# Livestream Link Monitor

A Node.js application that monitors Twitch chat and Discord channels for livestream links and automatically records them to a configurable backend (Google Sheets, StreamSource API, or both).

## Features

- **Multi-Platform Monitoring**
  - Discord channel message monitoring
  - Twitch channel chat monitoring
  - Real-time URL detection and processing

- **Streaming Platform Support**
  - Twitch (twitch.tv)
  - YouTube (youtube.com, youtu.be)
  - TikTok (tiktok.com)
  - Kick (kick.com)
  - Facebook (facebook.com, fb.watch)

- **Flexible Backend System**
  - Google Sheets integration (full features)
  - StreamSource API integration
  - Dual-backend mode for redundancy
  - Migration support between backends

- **Smart Features**
  - Automatic deduplication across backends
  - Location parsing from messages (city/state detection)
  - User and URL ignore lists
  - Per-user rate limiting
  - Platform-specific username extraction

- **User Feedback**
  - Discord reaction confirmations (✅, 🔁, ❌)
  - Twitch chat reply confirmations
  - Configurable confirmation behavior

- **Security & Performance**
  - URL validation and security checks
  - Docker containerization
  - Graceful shutdown handling
  - Comprehensive logging
  - Health monitoring

## Quick Start

### Prerequisites

1. **Node.js** (v16 or higher) - if running locally
2. **Docker** & **Docker Compose** - for containerized deployment
3. **Discord Bot** - [Create at Discord Developer Portal](https://discord.com/developers/applications)
4. **Backend Account** - Either Google Sheets or StreamSource (or both)

### Basic Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd livestream-link-monitor
   ```

2. **Copy environment template**
   ```bash
   cp .env.example .env
   ```

3. **Configure core settings** in `.env`:
   ```bash
   # Discord Configuration
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CHANNEL_ID=your_channel_id
   
   # Twitch Configuration
   TWITCH_CHANNEL=channel_name_without_hash
   
   # Google Sheets (if using)
   GOOGLE_SHEET_ID=your_sheet_id
   ```

4. **Choose your backend** (see [Backend Configuration](#backend-configuration) below)

5. **Run with Docker**
   ```bash
   docker compose up -d
   ```

   Or run locally:
   ```bash
   npm install
   npm start
   ```

## Backend Configuration

### Option 1: Google Sheets (Recommended for Beginners)

**Pros:** Easy setup, visual interface, full feature support, free  
**Cons:** Requires Google Cloud setup, API quotas

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project
   - Enable Google Sheets API
   - Create service account
   - Download credentials as `credentials.json`

2. **Setup Google Sheet**
   - Create new Google Sheet
   - Add required tabs (see [Sheet Structure](#google-sheet-structure))
   - Share with service account email

3. **Configure in `.env`**
   ```bash
   GOOGLE_SHEET_ID=your_sheet_id
   GOOGLE_CREDENTIALS_PATH=./credentials.json
   ```

### Option 2: StreamSource API

**Pros:** Proper REST API, programmatic access, scalable  
**Cons:** No ignore lists or location parsing (yet), requires account

1. **Create StreamSource Account**

2. **Configure in `.env`**
   ```bash
   BACKEND_MODE=single
   BACKEND_PRIMARY=streamSource
   BACKEND_GOOGLE_SHEETS_ENABLED=false
   BACKEND_STREAMSOURCE_ENABLED=true
   STREAMSOURCE_EMAIL=your@email.com
   STREAMSOURCE_PASSWORD=your_password
   ```

### Option 3: Both Backends (Best of Both Worlds)

1. **Setup both backends** (see above)

2. **Configure for dual-write**
   ```bash
   BACKEND_MODE=dual-write
   BACKEND_PRIMARY=googleSheets
   BACKEND_GOOGLE_SHEETS_ENABLED=true
   BACKEND_STREAMSOURCE_ENABLED=true
   ```

For detailed backend setup, see:
- [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) - Step-by-step guide
- [BACKEND_QUICK_REFERENCE.md](BACKEND_QUICK_REFERENCE.md) - Quick selection guide
- [BACKEND_CONFIGURATION.md](BACKEND_CONFIGURATION.md) - Detailed configuration

## Google Sheet Structure

Create these tabs in your Google Sheet:

### Main Tab: "Livesheet"
Headers in row 1:
```
Source | Platform | Status | Link | Added Date | Posted By | City | State
```

### Ignore List Tabs
- **"Twitch User Ignorelist"** - Column A: Username
- **"Discord User Ignorelist"** - Column A: Username  
- **"URL Ignorelist"** - Column A: URL

### Location Data Tab
- **"Known Cities"** - Column A: City, Column B: State

Example cities:
```
City          | State
New York City | NY
Los Angeles   | CA
Chicago       | IL
```

## Configuration Reference

See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for complete reference.

### Essential Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Discord bot token | Yes |
| `DISCORD_CHANNEL_ID` | Discord channel to monitor | Yes |
| `TWITCH_CHANNEL` | Twitch channel to monitor | Yes |
| `GOOGLE_SHEET_ID` | Google Sheet ID | Yes* |

*Required even when using StreamSource only (technical limitation)

### Common Optional Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per user | 10 |
| `LOG_LEVEL` | Logging verbosity | info |
| `DISCORD_CONFIRM_REACTION` | Send Discord reactions | true |
| `TWITCH_CONFIRM_REPLY` | Send Twitch replies | true |

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start the application
docker compose up -d

# View logs
docker compose logs -f

# Stop the application
docker compose down
```

### Docker Configuration

The application runs with:
- Node.js 18 Alpine base image
- Non-root user for security
- Health checks every 30 seconds
- Automatic restart on failure
- Resource limits: 512MB RAM, 0.5 CPU

## Development

### Local Development

```bash
# Install dependencies
npm install

# Run with auto-reload
npm run dev

# Run normally
npm start
```

### Testing Backends

```bash
# Test Google Sheets connection
node test-sheets.js

# Test StreamSource connection
node test-streamsource.js
```

### Project Structure

```
livestream-link-monitor/
├── index.js                 # Main application
├── config.js               # Environment config
├── lib/
│   ├── backends/          # Backend implementations
│   ├── locationParser.js  # City/state detection
│   ├── platformDetector.js # URL processing
│   ├── rateLimiter.js     # Spam prevention
│   └── urlValidator.js    # Security validation
├── docker-compose.yml     # Docker config
└── docs/                  # Documentation
```

## Features in Detail

### Location Parsing
- Extracts city and state from messages
- Supports common abbreviations (NYC, LA, SF)
- Case-insensitive matching
- Configurable known cities list
- *Note: Only available with Google Sheets backend*

### Ignore Lists
- Filter out specific users or URLs
- Separate lists for Twitch and Discord users
- Automatically synced every 10 seconds
- *Note: Only available with Google Sheets backend*

### Rate Limiting
- Prevents spam from individual users
- Configurable time window and request limit
- Per-platform user tracking
- Automatic cleanup of old entries

### URL Processing
- Validates streaming platform URLs
- Normalizes URLs (adds protocol, etc.)
- Resolves shortened/redirect URLs
- Extracts platform and username
- Security validation (no private IPs)

## Troubleshooting

### Common Issues

**Bot not responding**
- Check Discord bot has message reading permissions
- Verify channel IDs are correct
- Ensure bot is online in Discord

**URLs not saving**
- Check backend authentication
- Verify backend is enabled in config
- Look for errors in logs
- Test backend connection separately

**Duplicate entries**
- Restart application to rebuild cache
- Check if using multiple backends
- Verify URL normalization working

**Location not detected**
- Ensure Known Cities tab has data
- Check Google Sheets backend is enabled
- Verify message contains valid city

For detailed troubleshooting, see [BACKEND_TROUBLESHOOTING.md](BACKEND_TROUBLESHOOTING.md)

## Monitoring & Logs

### Application Logs
- Location: `./logs/app.log` (local) or `/app/logs/app.log` (Docker)
- Configurable level: error, warn, info, debug
- Includes timestamps and structured data

### Docker Logs
```bash
# View all logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View last 100 lines
docker compose logs --tail 100
```

### Health Monitoring
- Health endpoint available (when implemented)
- Docker health checks every 30 seconds
- Automatic container restart on failure

## Security

### Best Practices
1. **Never commit** `.env` or `credentials.json`
2. **Use strong passwords** for StreamSource
3. **Rotate tokens** if exposed
4. **Limit permissions** to minimum required
5. **Review ignore lists** regularly

### Security Features
- URL validation prevents malicious links
- Rate limiting prevents spam
- Docker runs as non-root user
- Input length limits
- Private IP blocking

## Contributing

### Adding New Platforms

1. Add URL pattern to `lib/platformDetector.js`:
   ```javascript
   const streamingPatterns = [
     // ... existing patterns
     /https?:\/\/(www\.)?newplatform\.com\/\S+/gi
   ];
   ```

2. Update platform detection:
   ```javascript
   function detectPlatform(url) {
     // ... existing checks
     if (url.includes('newplatform.com')) return 'NewPlatform';
   }
   ```

3. Add to allowed domains in `lib/urlValidator.js`

### Adding New Backends

1. Create new class extending `BaseBackend`
2. Implement all required methods
3. Add to `BackendManager`
4. Update configuration

## Migration

To migrate between backends, see [BACKEND_MIGRATION_GUIDE.md](BACKEND_MIGRATION_GUIDE.md)

## Documentation

- [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) - Detailed setup guide
- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) - All configuration options
- [BACKEND_CONFIGURATION.md](BACKEND_CONFIGURATION.md) - Backend details
- [BACKEND_QUICK_REFERENCE.md](BACKEND_QUICK_REFERENCE.md) - Quick backend selection
- [BACKEND_TROUBLESHOOTING.md](BACKEND_TROUBLESHOOTING.md) - Problem solving
- [BACKEND_MIGRATION_GUIDE.md](BACKEND_MIGRATION_GUIDE.md) - Migration instructions
- [CLAUDE.md](CLAUDE.md) - Technical details for AI assistants

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or contributions:
1. Check the troubleshooting guide
2. Review existing documentation
3. Enable debug logging for more details
4. Open an issue with logs and configuration (sanitized)