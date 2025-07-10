# Livestream Link Monitor

A Node.js application that monitors Twitch chat and Discord channels for livestream links and automatically records them to the StreamSource API.

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

- **StreamSource API Integration**
  - Centralized stream data management
  - Real-time updates via API
  - User and URL ignore lists
  - Known cities validation

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
4. **StreamSource Account** - Required for API access
5. **Make** (optional) - For using the Makefile commands

### Basic Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd livestream-link-monitor
   ```

2. **Use the Makefile for easy setup**
   ```bash
   make install    # Install dependencies and create .env
   make help       # See all available commands
   ```

   Or manually:
   ```bash
   npm install
   cp .env.example .env
   ```

3. **Configure core settings** in `.env`:
   ```bash
   # Discord Configuration
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CHANNEL_ID=your_channel_id
   
   # Twitch Configuration
   TWITCH_CHANNEL=channel_name_without_hash
   
   # StreamSource API (required)
   STREAMSOURCE_EMAIL=your_email
   STREAMSOURCE_PASSWORD=your_password
   ```

4. **Configure StreamSource API** credentials in `.env`

5. **Start the application**
   ```bash
   make start      # Production mode with Docker
   make dev        # Development mode with auto-reload
   make logs       # View logs
   ```

   Or manually:
   ```bash
   docker compose up -d    # Production
   npm run dev             # Development
   ```

## StreamSource API Configuration

The application uses StreamSource API as its backend for storing stream data, managing ignore lists, and validating locations.

### Features:
- **Stream Management:** Automatic deduplication and storage
- **Ignore Lists:** Manage blocked users and URLs via API
- **Location Validation:** Known cities database for accurate location parsing
- **Real-time Updates:** Instant data synchronization

### Setup:

1. **Create StreamSource Account**
   - Contact the StreamSource team for API access
   - Obtain your login credentials

2. **Configure in `.env`**
   ```bash
   # StreamSource API Configuration
   STREAMSOURCE_API_URL=https://api.streamsource.com
   STREAMSOURCE_EMAIL=your@email.com
   STREAMSOURCE_PASSWORD=your_password
   ```

That's it! The application will automatically connect to StreamSource on startup.

## Data Management in StreamSource

### Stream Data
Streams are automatically added with the following information:
- **Source:** Where the link was found (Discord/Twitch)
- **Platform:** Streaming platform (Twitch, YouTube, etc.)
- **Link:** The stream URL
- **Location:** Parsed city/state from the message
- **Posted By:** Username who shared the link

### Ignore Lists
Manage blocked users and URLs through the StreamSource admin panel:
- **Twitch Users:** Block specific Twitch usernames
- **Discord Users:** Block specific Discord usernames
- **URLs:** Block specific stream URLs
- **Domains:** Block entire domains

### Location Management
StreamSource maintains a database of known cities for accurate location parsing. Cities are validated against this database when LOCATION_VALIDATION is enabled.

## Configuration Reference

See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for complete reference.

### Essential Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Discord bot token | Yes |
| `DISCORD_CHANNEL_ID` | Discord channel to monitor | Yes |
| `TWITCH_CHANNEL` | Twitch channel to monitor | Yes |
| `STREAMSOURCE_EMAIL` | StreamSource login email | Yes |
| `STREAMSOURCE_PASSWORD` | StreamSource password | Yes |

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

### Using Make Commands

The project includes a comprehensive Makefile for common tasks:

```bash
make help          # Show all available commands
make install       # Set up the project
make dev           # Start development mode
make start         # Start production mode
make stop          # Stop the application
make restart       # Restart the application
make logs          # View logs (tail -f)
make status        # Check application status
make clean         # Clean up logs and temp files
make test-backends # Test backend connections
```

Shortcuts available:
- `make d` → `make dev`
- `make s` → `make start`
- `make l` → `make logs`
- `make r` → `make restart`

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
# Using Makefile
make test-backends     # Test all configured backends
make env-check        # Validate environment configuration

# Or run directly
node test-sheets.js        # Test Google Sheets connection
node test-streamsource.js  # Test StreamSource connection
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