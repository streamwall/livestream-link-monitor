// Helper to clear module cache for testing
function clearModuleCache() {
  // Clear all module caches except node_modules
  Object.keys(require.cache).forEach(key => {
    if (!key.includes('node_modules')) {
      delete require.cache[key];
    }
  });
}

module.exports = { clearModuleCache };
