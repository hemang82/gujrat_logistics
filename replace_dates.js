const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app', 'admin');

function walkSync(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkSync(fullPath, callback);
    } else {
      callback(fullPath);
    }
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Regex to match {new Date(something).toLocaleDateString(...)}
  // and new Date(something).toLocaleDateString(...)
  
  // Actually, we can just replace new Date(...).toLocaleDateString(...) with formatDate(...)
  // We need to match things like `new Date(invoice.invoiceDate).toLocaleDateString('en-IN')`
  // and `new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })`
  
  const regex1 = /new\s+Date\(([^)]+)\)\.toLocaleDateString\([^)]*\)/g;
  const regex2 = /([a-zA-Z0-9_.]+)\s*\?\s*new\s+Date\(\1\)\.toLocaleDateString\([^)]*\)\s*:\s*['"](?:N\/A|-)['"]/g;
  
  // Fix 1: replace complex ternary
  // e.g. bk.deliveryDate ? new Date(bk.deliveryDate).toLocaleDateString(...) : 'N/A'
  // -> formatDate(bk.deliveryDate)
  content = content.replace(regex2, (match, p1) => {
      return `formatDate(${p1})`;
  });

  // Fix 2: replace standard new Date(..).toLocaleDateString(..)
  content = content.replace(regex1, (match, p1) => {
      return `formatDate(${p1})`;
  });

  if (content !== originalContent) {
      // Add import { formatDate } from '@/lib/dateUtils'; if it's not there
      if (!content.includes('import { formatDate }') && !content.includes('import {formatDate}')) {
          // Find last import statement
          const importRegex = /import\s+.*?['"].*?['"];?\n/g;
          let lastIndex = 0;
          let m;
          while ((m = importRegex.exec(content)) !== null) {
              lastIndex = m.index + m[0].length;
          }
          if (lastIndex > 0) {
              content = content.slice(0, lastIndex) + "import { formatDate } from '@/lib/dateUtils';\n" + content.slice(lastIndex);
          } else {
              content = "import { formatDate } from '@/lib/dateUtils';\n" + content;
          }
      }
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
  }
}

walkSync(srcDir, processFile);
console.log('Done!');
