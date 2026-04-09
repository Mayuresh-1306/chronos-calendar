const fs = require('fs');
try {
  fs.rmSync('.next', { recursive: true, force: true });
  console.log('Successfully deleted .next cache!');
} catch (err) {
  console.error('Failed to delete cache:', err);
}
