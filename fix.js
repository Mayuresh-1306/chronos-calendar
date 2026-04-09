const fs = require('fs');
const { execSync } = require('child_process');

try {
  fs.unlinkSync('C:\\Users\\Admin\\package-lock.json');
  console.log('Successfully deleted the rogue lockfile in Admin directory.');
} catch (e) {
  console.log('Could not delete lockfile or it is already gone:', e.message);
}

try {
  execSync('taskkill /PID 12500 /F');
  console.log('Successfully killed process 12500.');
} catch (e) {
  console.log('Could not kill 12500:', e.message);
}

try {
  execSync('taskkill /F /IM node.exe');
  console.log('Successfully killed all node processes.');
} catch (e) {
  console.log('No other node processes found.');
}
