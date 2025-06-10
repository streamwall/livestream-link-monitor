const delay = ms => new Promise(r => setTimeout(r, ms));

// Platform-specific live detection logic
async function checkLiveStatus(page, platform) {
  let isLive = false;
  let title = '';
  
  switch (platform) {
    case 'Twitch':
      isLive = await page.locator('[data-a-target="stream-indicator"]').count() > 0 ||
               await page.locator('.live-indicator').count() > 0;
      title = await page.locator('h1').first().textContent().catch(() => '');
      break;

    case 'YouTube':
      isLive = await page.locator('.ytp-live-badge').count() > 0 ||
               await page.locator('[aria-label*="LIVE"]').count() > 0;
      title = await page.locator('h1.ytd-video-primary-info-renderer').textContent().catch(() => '');
      break;

    case 'TikTok':
      await delay(3000); // Wait for TikTok to load
      const html = await page.content();
      const viewerIconVisible = await page.locator('svg[aria-label*="viewer"] ~ span').first().isVisible();
      isLive = viewerIconVisible || html.includes('"isLiveBroadcast":true');
      title = await page.locator('h2[data-e2e="user-profile-uid"]').textContent().catch(() => '');
      break;

    case 'Kick':
      isLive = await page.locator('.stream-status-live').count() > 0;
      title = await page.locator('.stream-title').textContent().catch(() => '');
      break;

    case 'Facebook':
      isLive = await page.locator('[aria-label*="LIVE"]').count() > 0 ||
               await page.locator('.live-indicator').count() > 0;
      title = await page.locator('h2').first().textContent().catch(() => '');
      break;
  }
  
  return { isLive, title: title.trim() };
}

module.exports = { checkLiveStatus };