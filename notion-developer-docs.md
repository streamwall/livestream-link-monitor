# Notion Backend Setup Guide

This guide will help you set up Notion as an alternative backend for the Livestream Link Monitor.

## Prerequisites

- A Notion account
- Admin access to create integrations and databases

## Step 1: Create a Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give your integration a name (e.g., "Livestream Monitor")
4. Select the workspace where you want to use this integration
5. Click "Submit"
6. Copy the "Internal Integration Token" - you'll need this for the `NOTION_TOKEN` environment variable

## Step 2: Create the Main Streams Database

1. In Notion, create a new page where you want your database
2. Create a new database with the following properties:

   | Property Name | Property Type | Notes |
   |--------------|---------------|-------|
   | Link | URL | The stream URL |
   | Platform | Select | Options: Twitch, YouTube, TikTok, Kick, Facebook |
   | Status | Select | Options: Live, Offline, Unknown |
   | City | Text | City name |
   | State | Text | State name or abbreviation |
   | Posted By | Text | Discord/Twitch username |
   | Source | Title | Streamer username extracted from URL |
   | Created Time | Created time | Automatic |

3. Copy the database ID from the URL:
   - Open the database as a full page
   - The URL will look like: `https://www.notion.so/workspace/1234567890abcdef1234567890abcdef?v=...`
   - The database ID is: `1234567890abcdef1234567890abcdef`
   - Set this as your `NOTION_DATABASE_ID` environment variable

## Step 3: Share the Database with Your Integration

1. Open your streams database
2. Click the "..." menu in the top right
3. Select "Add connections"
4. Search for and select your integration
5. Click "Confirm"

## Step 4: Create Configuration Databases (Optional)

If you want to manage ignore lists and known cities in Notion instead of Google Sheets:

### Twitch User Ignore List Database
Create a database with a single "Title" or "Username" property for Twitch usernames to ignore.

### Discord User Ignore List Database
Create a database with a single "Title" or "Username" property for Discord usernames to ignore.

### URL Ignore List Database
Create a database with a single "Title" or "URL" property for URLs to ignore.

### Known Cities Database
Create a database with:
- City (Title or Text property)
- State (Text property)

For each database:
1. Copy the database ID from the URL
2. Share the database with your integration
3. Set the corresponding environment variable:
   - `NOTION_TWITCH_IGNORE_DB_ID`
   - `NOTION_DISCORD_IGNORE_DB_ID`
   - `NOTION_URL_IGNORE_DB_ID`
   - `NOTION_KNOWN_CITIES_DB_ID`

## Step 5: Configure Environment Variables

Add these to your `.env` file:

```env
# Backend Selection
BACKEND_TYPE=notion

# Notion API Configuration
NOTION_TOKEN=your_integration_token_here
NOTION_DATABASE_ID=your_main_database_id_here

# Optional: Configuration Database IDs
NOTION_TWITCH_IGNORE_DB_ID=your_twitch_ignore_db_id
NOTION_DISCORD_IGNORE_DB_ID=your_discord_ignore_db_id
NOTION_URL_IGNORE_DB_ID=your_url_ignore_db_id
NOTION_KNOWN_CITIES_DB_ID=your_known_cities_db_id
```

## Step 6: Run the Application

```bash
npm install
npm start
```

## Switching Between Backends

To switch between Google Sheets and Notion backends, simply change the `BACKEND_TYPE` environment variable:
- `BACKEND_TYPE=sheets` - Use Google Sheets (default)
- `BACKEND_TYPE=notion` - Use Notion API

## Notes

- The Notion backend respects API rate limits (3 requests per second average)
- Duplicate URLs are automatically detected before creating new entries
- If configuration databases are not set up, the application will fall back to Google Sheets for those features
- The application will automatically create properly formatted entries in your Notion database

## Troubleshooting

1. **"NOTION_TOKEN is required" error**: Make sure you've set the `NOTION_TOKEN` environment variable
2. **"NOTION_DATABASE_ID is required" error**: Make sure you've set the `NOTION_DATABASE_ID` environment variable
3. **"Unauthorized" errors**: Ensure you've shared the database with your integration
4. **Rate limiting errors**: The client automatically handles rate limits with retry logic
5. **Missing properties**: Ensure your database has all the required properties with the correct types