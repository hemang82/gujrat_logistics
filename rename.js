const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let newContent = content.replace(/LogiMaster/g, 'Trust Logistic');
      newContent = newContent.replace(/logimaster\.com/g, 'trustlogistic.in');
      newContent = newContent.replace(/Logi<span className="(.*?)">Master<\/span>/g, 'Trust <span className="$1">Logistic</span>');
      newContent = newContent.replace(/Logi<span className=\{!\w+ \? "(.*?)" : "(.*?)"\}>Master<\/span>/g, 'Trust <span className={!shouldBeTransparent ? "$1" : "$2"}>Logistic</span>');

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'src', 'app', '(public)'));
replaceInDir(path.join(__dirname, 'src', 'components', 'public'));
