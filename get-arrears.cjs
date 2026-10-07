const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const feesPath = path.join(__dirname, 'external excel files', 'SCHOOL FEES.xlsx');
const workbook = xlsx.readFile(feesPath);
const sheetName = 'term two fees';
const sheet = workbook.Sheets[sheetName];

if (sheet) {
  const data = xlsx.utils.sheet_to_json(sheet, { defval: 0 });
  const withArrears = data.filter(r => (r[' outstanding '] > 0) || (r[' balance '] > 0));
  console.log(`Found ${withArrears.length} students with outstanding or balance`);
  if (withArrears.length > 0) {
    console.log(withArrears.slice(0, 3));
  }
}
