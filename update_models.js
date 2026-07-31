const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src', 'models');
const models = fs.readdirSync(modelsDir).filter(f => f.endsWith('.ts') && f !== 'User.ts' && f !== 'Branch.ts' && f !== 'DemoRequest.ts' && f !== 'ApiLog.ts');

models.forEach(modelFile => {
  const p = path.join(modelsDir, modelFile);
  let content = fs.readFileSync(p, 'utf8');

  let updated = false;

  // Add to Interface
  // Look for `export interface I... extends Document {`
  const interfaceRegex = /(export interface I[A-Za-z]+ extends Document \{)/;
  if (interfaceRegex.test(content) && !content.includes('logisticId?: mongoose.Types.ObjectId')) {
    content = content.replace(interfaceRegex, `$1\n  logisticId?: mongoose.Types.ObjectId;`);
    updated = true;
  } else if (!content.includes('logisticId?: mongoose.Types.ObjectId')) {
    // Some might not extend Document inline, look for `export interface I[A-Za-z]+ {`
    const altRegex = /(export interface I[A-Za-z]+ \{)/;
    if (altRegex.test(content)) {
      content = content.replace(altRegex, `$1\n  logisticId?: mongoose.Types.ObjectId;`);
      updated = true;
    }
  }

  // Add to Schema
  // Look for `const [A-Za-z]+Schema = new Schema<[A-Za-z]+>\(\s*\{`
  const schemaRegex = /(const [A-Za-z]+Schema = new Schema(?:<[^>]+>)?\(\s*\{)/;
  if (schemaRegex.test(content) && !content.includes('logisticId: { type: Schema.Types.ObjectId')) {
    content = content.replace(schemaRegex, `$1\n    logisticId: { type: Schema.Types.ObjectId, ref: 'User' },`);
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated model: ${modelFile}`);
  } else {
    console.log(`Skipped or already updated: ${modelFile}`);
  }
});
