const fs = require('fs');

const newFile = fs.readFileSync('src/app/admin/(dashboard)/bookings/new/page.tsx', 'utf-8');
let editFile = fs.readFileSync('src/app/admin/(dashboard)/bookings/[id]/edit/page.tsx', 'utf-8');

// Extract Hooks
const hooksRegex = /\/\/ Autocomplete suggestion states[\s\S]*?(?=\/\/ Consignor suggestions autocomplete)/;
const hooksMatch = newFile.match(hooksRegex);
if (!hooksMatch) { console.log("hooks missing"); process.exit(1); }
const hooksStr = hooksMatch[0];

const editHooksRegex = /\/\/ Autocomplete suggestion states[\s\S]*?(?=\/\/ Consignor suggestions autocomplete)/;
editFile = editFile.replace(editHooksRegex, hooksStr);

// Extract JSX
const startStr = '<div className="bg-gray-50 border-b border-gray-200 p-2.5 grid grid-cols-12 gap-3 text-xs font-bold text-gray-700 hidden lg:grid uppercase tracking-wider rounded-t-lg">';
let endStr = '</div>\r\n              </div>\r\n            </div>';
if (newFile.indexOf(endStr) === -1) {
  endStr = '</div>\n              </div>\n            </div>';
}
const jsxStartIndex = newFile.indexOf(startStr);
const jsxEndIndex = newFile.indexOf(endStr, jsxStartIndex);
const jsxStr = newFile.substring(jsxStartIndex, jsxEndIndex + endStr.length);
if(jsxStartIndex === -1 || jsxEndIndex === -1) {
    console.log("JSX not found");
    process.exit(1);
}

const editStartStr = '<div className="bg-gray-50 border-b border-gray-200 p-2.5 grid grid-cols-12 gap-3 text-xs font-bold text-gray-700 hidden lg:grid uppercase tracking-wider">';
const editEndStr = '</div>\n              </div>\n            </div>';
let ees = '</div>\r\n              </div>\r\n            </div>';
if(editFile.indexOf(ees) === -1) {
    ees = editEndStr;
}
const editJsxStartIndex = editFile.indexOf(editStartStr);
const editJsxEndIndex = editFile.indexOf(ees, editJsxStartIndex);
const editJsxStr = editFile.substring(editJsxStartIndex, editJsxEndIndex + ees.length);

if(editJsxStartIndex === -1 || editJsxEndIndex === -1) {
    console.log("edit JSX not found");
    process.exit(1);
}

editFile = editFile.replace(editJsxStr, jsxStr);
fs.writeFileSync('src/app/admin/(dashboard)/bookings/[id]/edit/page.tsx', editFile);
console.log("Merged!");
