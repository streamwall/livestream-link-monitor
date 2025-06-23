require('dotenv').config();
const StreamSourceClient = require('./lib/streamSourceClient');
const config = require('./config');

async function testStreamSource() {
  console.log('Testing StreamSource API integration...\n');

  // Initialize client
  const client = new StreamSourceClient(config);
  
  try {
    // Test authentication
    console.log('1. Testing authentication...');
    await client.authenticate();
    console.log('✅ Authentication successful!\n');

    // Test stream creation
    console.log('2. Testing stream creation...');
    const testStream = {
      url: 'https://www.twitch.tv/teststreamer123',
      platform: 'twitch',
      username: 'teststreamer123',
      city: 'Los Angeles',
      state: 'CA',
      postedBy: 'testuser',
      source: 'Discord'
    };

    const result = await client.createStream(testStream);
    if (result.exists) {
      console.log('⚠️  Stream already exists in StreamSource');
    } else {
      console.log('✅ Stream created successfully!');
      console.log(`   Stream ID: ${result.id}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Platform: ${result.platform}`);
      console.log(`   Status: ${result.status}\n`);
    }

    // Test duplicate detection
    console.log('3. Testing duplicate detection...');
    const exists = await client.streamExists(testStream.url);
    console.log(`✅ Duplicate detection working! Stream exists: ${exists}\n`);

    // Test streamer creation
    console.log('4. Testing streamer find/create...');
    const streamer = await client.findOrCreateStreamer('teststreamer123', 'twitch');
    if (streamer) {
      console.log('✅ Streamer found/created successfully!');
      console.log(`   Streamer ID: ${streamer.id}`);
      console.log(`   Username: ${streamer.username}`);
      console.log(`   Platform: ${streamer.primary_platform}\n`);
    } else {
      console.log('⚠️  Streamer creation skipped or failed\n');
    }

    // Test getting streams
    console.log('5. Testing stream retrieval...');
    const streams = await client.getStreams({ per_page: 5 });
    console.log(`✅ Retrieved ${streams.data.length} streams`);
    if (streams.data.length > 0) {
      console.log('   First stream:', {
        id: streams.data[0].id,
        url: streams.data[0].url,
        platform: streams.data[0].platform,
        status: streams.data[0].status
      });
    }

    console.log('\n✅ All tests passed! StreamSource integration is working correctly.');
    console.log('\nYou can now run the main application with:');
    console.log('  npm start');
    console.log('\nMake sure you have set these environment variables:');
    console.log('  - STREAMSOURCE_USERNAME');
    console.log('  - STREAMSOURCE_PASSWORD');
    console.log('  - DISCORD_TOKEN');
    console.log('  - DISCORD_CHANNEL_ID');
    console.log('  - TWITCH_CHANNEL');
    console.log('  - GOOGLE_SHEET_ID (for ignore lists and known cities)');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.error('\nMake sure:');
    console.error('1. StreamSource is running at', config.STREAMSOURCE_API_URL);
    console.error('2. You have valid credentials in STREAMSOURCE_USERNAME and STREAMSOURCE_PASSWORD');
    console.error('3. The API endpoints match the expected format');
  }
}

testStreamSource();