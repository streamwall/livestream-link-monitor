# Backend Migration Guide

This guide helps you migrate between different backend configurations safely.

## Migration Scenarios

### 1. Google Sheets → StreamSource

This is the most common migration path when you need API access.

#### Phase 1: Preparation
1. **Set up StreamSource account**
   ```bash
   # Get your StreamSource credentials ready
   STREAMSOURCE_EMAIL=your@email.com
   STREAMSOURCE_PASSWORD=your_password
   ```

2. **Test StreamSource connection**
   ```bash
   # Add to .env temporarily
   BACKEND_MODE=dual-write
   BACKEND_STREAMSOURCE_ENABLED=true
   
   # Run the app and check logs for:
   # "StreamSource backend initialized"
   ```

#### Phase 2: Dual-Write Mode
1. **Enable both backends**
   ```bash
   # .env configuration
   BACKEND_MODE=dual-write
   BACKEND_PRIMARY=googleSheets
   BACKEND_GOOGLE_SHEETS_ENABLED=true
   BACKEND_STREAMSOURCE_ENABLED=true
   ```

2. **Run for 24-48 hours**
   - Monitor logs for any StreamSource errors
   - Verify new links appear in both places
   - Check deduplication works correctly

3. **Verify data consistency**
   ```bash
   # Check both backends have same stream count
   # Note: Historical data won't be in StreamSource yet
   ```

#### Phase 3: Data Migration (Optional)
If you need historical data in StreamSource:

```javascript
// migrate-to-streamsource.js
require('dotenv').config();
const BackendManager = require('./lib/backends/BackendManager');
const logger = require('winston').createLogger({
  transports: [new winston.transports.Console()]
});

async function migrate() {
  const manager = new BackendManager(process.env, logger);
  await manager.initialize();
  
  console.log('Starting migration...');
  const result = await manager.migrateData('googleSheets', 'streamSource');
  console.log(`Migration complete: ${result.migrated} succeeded, ${result.failed} failed`);
}

migrate().catch(console.error);
```

#### Phase 4: Switch Primary
1. **Change primary backend**
   ```bash
   BACKEND_MODE=dual-write
   BACKEND_PRIMARY=streamSource  # Changed from googleSheets
   ```

2. **Monitor for issues**
   - Run for another 24-48 hours
   - Ensure ignore lists still work (from Google Sheets)
   - Verify location parsing continues

#### Phase 5: StreamSource Only (Optional)
**⚠️ Warning: You'll lose ignore lists and location parsing**

```bash
BACKEND_MODE=single
BACKEND_PRIMARY=streamSource
BACKEND_GOOGLE_SHEETS_ENABLED=false
BACKEND_STREAMSOURCE_ENABLED=true
```

### 2. StreamSource → Google Sheets

Less common, but useful if you need the full feature set.

#### Phase 1: Set Up Google Sheets
1. **Create Google Sheet** with required tabs
2. **Set up service account** and download credentials
3. **Share sheet** with service account email

#### Phase 2: Enable Dual Mode
```bash
BACKEND_MODE=dual-write
BACKEND_PRIMARY=streamSource  # Keep StreamSource as primary initially
BACKEND_GOOGLE_SHEETS_ENABLED=true
BACKEND_STREAMSOURCE_ENABLED=true
```

#### Phase 3: Populate Google Sheets
1. **Add ignore lists** manually to appropriate tabs
2. **Add known cities** for location parsing
3. **Let new streams** populate automatically

#### Phase 4: Switch Primary
```bash
BACKEND_MODE=single
BACKEND_PRIMARY=googleSheets
BACKEND_GOOGLE_SHEETS_ENABLED=true
BACKEND_STREAMSOURCE_ENABLED=false
```

### 3. Single Backend → Dual Backend

Useful for redundancy or testing.

#### For Google Sheets Users
```bash
# From this:
BACKEND_MODE=single
BACKEND_PRIMARY=googleSheets

# To this:
BACKEND_MODE=dual-write
BACKEND_PRIMARY=googleSheets
BACKEND_STREAMSOURCE_ENABLED=true
STREAMSOURCE_EMAIL=xxx
STREAMSOURCE_PASSWORD=xxx
```

#### For StreamSource Users
```bash
# From this:
BACKEND_MODE=single
BACKEND_PRIMARY=streamSource

# To this:
BACKEND_MODE=dual-write
BACKEND_PRIMARY=streamSource
BACKEND_GOOGLE_SHEETS_ENABLED=true
GOOGLE_SHEET_ID=xxx
GOOGLE_CREDENTIALS_PATH=./credentials.json
```

## Migration Best Practices

### 1. Always Test First
- Use dual-write mode before switching
- Monitor logs for errors
- Verify data consistency

### 2. Backup Your Data
- Export Google Sheets before major changes
- Save StreamSource data if available
- Keep configuration backups

### 3. Gradual Migration
```
Single Backend → Dual Write → Test → Switch Primary → Single Backend
```

### 4. Monitor Key Metrics
- **New stream creation** - Are they being saved?
- **Deduplication** - Are duplicates prevented?
- **Ignore lists** - Are they working? (Google Sheets only)
- **Location parsing** - Are cities detected? (Google Sheets only)

## Rollback Procedures

### If StreamSource Fails
```bash
# Quick rollback to Google Sheets only
BACKEND_MODE=single
BACKEND_PRIMARY=googleSheets
BACKEND_GOOGLE_SHEETS_ENABLED=true
BACKEND_STREAMSOURCE_ENABLED=false
```

### If Google Sheets Fails
```bash
# Quick rollback to StreamSource only
BACKEND_MODE=single
BACKEND_PRIMARY=streamSource
BACKEND_GOOGLE_SHEETS_ENABLED=false
BACKEND_STREAMSOURCE_ENABLED=true
```

### If Dual Mode Has Issues
```bash
# Rollback to your previous primary
BACKEND_MODE=single
BACKEND_PRIMARY=your_previous_primary
# Disable the problematic backend
```

## Data Sync Strategies

### Full Sync (All Historical Data)
Best for complete migration:
1. Export all data from source
2. Import to destination
3. Handle duplicates carefully

### Incremental Sync (New Data Only)
Best for testing:
1. Start dual-write mode
2. Only new streams go to both
3. Historical data stays in original

### Selective Sync
For specific date ranges:
1. Export data within date range
2. Import to new backend
3. Useful for recent data only

## Common Migration Issues

### Issue: Duplicate Entries
**Cause:** Both backends have different URL normalization
**Solution:** Clear target backend before migration

### Issue: Missing Features
**Cause:** StreamSource lacks ignore lists/cities
**Solution:** Keep Google Sheets enabled in dual mode

### Issue: Rate Limits During Migration
**Cause:** Too many requests when migrating
**Solution:** Add delays between operations

### Issue: Authentication Expires
**Cause:** StreamSource token expires during long migration
**Solution:** Implement token refresh in migration script

## Migration Checklist

Before migration:
- [ ] Backup current data
- [ ] Test new backend credentials
- [ ] Document current configuration
- [ ] Plan rollback strategy

During migration:
- [ ] Enable dual-write mode
- [ ] Monitor logs for errors
- [ ] Verify data consistency
- [ ] Test all features

After migration:
- [ ] Confirm all features work
- [ ] Update documentation
- [ ] Remove old backend (if desired)
- [ ] Update monitoring/alerts

## Advanced Migration Script

For complex migrations with data transformation:

```javascript
// advanced-migrate.js
const sourceBackend = new GoogleSheetsBackend(config, logger);
const targetBackend = new StreamSourceBackend(config, logger);

async function migrateWithTransform() {
  await sourceBackend.initialize();
  await targetBackend.initialize();
  
  const allUrls = await sourceBackend.getExistingUrls();
  
  for (const url of allUrls) {
    // Get full stream data from source
    const streamData = await sourceBackend.getStreamByUrl(url);
    
    // Transform data if needed
    const transformed = {
      ...streamData,
      // Add any transformations
      notes: `Migrated from Google Sheets on ${new Date().toISOString()}`
    };
    
    // Add to target
    try {
      await targetBackend.addStream(transformed);
      console.log(`✅ Migrated: ${url}`);
    } catch (error) {
      console.error(`❌ Failed: ${url} - ${error.message}`);
    }
    
    // Rate limit compliance
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

Remember: Take your time with migrations. It's better to run in dual mode longer than to rush and lose data.