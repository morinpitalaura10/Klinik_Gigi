const fs = require('fs');
const b64 = fs.readFileSync('assets/icon.png', 'base64');
fs.writeFileSync('utils/logoBase64.ts', 'export const logoBase64 = "data:image/png;base64,' + b64 + '";\n');
console.log('Done');
