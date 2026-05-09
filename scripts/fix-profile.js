const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', '(main)', 'profile', 'page.jsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('Total lines before:', lines.length);

// Keep only lines 0-715 (first 716 lines = the clean component)
const cleaned = lines.slice(0, 716).join('\n');
fs.writeFileSync(filePath, cleaned, 'utf8');

console.log('Done! Cleaned file has', 716, 'lines.');
