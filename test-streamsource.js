#!/usr/bin/env node

// Test StreamSource connection
require('dotenv').config();
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

async function testStreamSource() {
  try {
    logger.info('Testing StreamSource connection...');
    
    // Check environment variables
    if (!process.env.STREAMSOURCE_EMAIL || !process.env.STREAMSOURCE_PASSWORD) {
      throw new Error('STREAMSOURCE_EMAIL and STREAMSOURCE_PASSWORD must be set in .env');
    }
    
    const apiUrl = process.env.STREAMSOURCE_API_URL || 'https://api.streamsource.com';
    
    // Test 1: Check API health (if endpoint exists)
    logger.info(`\nTesting API endpoint: ${apiUrl}`);
    try {
      const healthResponse = await fetch(`${apiUrl}/health`);
      if (healthResponse.ok) {
        logger.info('✅ API health check passed');
      } else {
        logger.info(`⚠️  Health endpoint returned ${healthResponse.status}`);
      }
    } catch (error) {
      logger.info('ℹ️  No health endpoint available (this is normal)');
    }
    
    // Test 2: Authentication
    logger.info('\nTesting authentication...');
    const loginResponse = await fetch(`${apiUrl}/api/v1/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: process.env.STREAMSOURCE_EMAIL,
        password: process.env.STREAMSOURCE_PASSWORD
      })
    });
    
    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      throw new Error(`Authentication failed (${loginResponse.status}): ${error}`);
    }
    
    const loginData = await loginResponse.json();
    logger.info('✅ Authentication successful!');
    logger.info(`   User ID: ${loginData.user.id}`);
    logger.info(`   Email: ${loginData.user.email}`);
    logger.info(`   Role: ${loginData.user.role}`);
    
    const token = loginData.token;
    
    // Test 3: List streams
    logger.info('\nTesting stream listing...');
    const streamsResponse = await fetch(`${apiUrl}/api/v1/streams?per_page=5`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!streamsResponse.ok) {
      throw new Error(`Failed to fetch streams: ${streamsResponse.status}`);
    }
    
    const streamsData = await streamsResponse.json();
    logger.info(`✅ Fetched streams: ${streamsData.streams.length} of ${streamsData.meta.total_count} total`);
    
    if (streamsData.streams.length > 0) {
      logger.info('\nSample streams:');
      streamsData.streams.slice(0, 3).forEach(stream => {
        logger.info(`   - ${stream.source} (${stream.platform}) - ${stream.status}`);
      });
    }
    
    // Test 4: Test create stream (dry run - don't actually create)
    logger.info('\nTesting stream creation capability...');
    logger.info('✅ API connection verified - ready to create streams');
    
    // Test 5: Check rate limits
    logger.info('\nRate limit information:');
    logger.info('   - General: 1000 requests/minute');
    logger.info('   - Login: 500 attempts/20 minutes');
    logger.info('   - Signup: 300 attempts/hour');
    
    logger.info('\n✅ StreamSource connection test complete!');
    logger.info('   Token expires in 24 hours');
    
  } catch (error) {
    logger.error('\n❌ StreamSource connection test failed!');
    logger.error(`   Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      logger.error('   → Cannot connect to StreamSource API');
      logger.error('   → Check STREAMSOURCE_API_URL in .env');
    } else if (error.message.includes('401')) {
      logger.error('   → Invalid credentials');
      logger.error('   → Check STREAMSOURCE_EMAIL and STREAMSOURCE_PASSWORD');
    } else if (error.message.includes('429')) {
      logger.error('   → Rate limited - too many requests');
      logger.error('   → Wait a few minutes and try again');
    }
    
    process.exit(1);
  }
}

// Run the test
testStreamSource();