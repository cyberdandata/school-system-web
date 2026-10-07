const xlsx = require('xlsx');

const files = [
  'external excel files/SCHOOL FEES.xlsx',
  'external excel files/income 2026.xlsx',
  'external excel files/STAFF LIST.xlsx'
];

files.forEach(file => {
  console.log(`\n--- Reading ${file} ---`);
  try {
    const workbook = xlsx.readFile(file);
    workbook.SheetNames.forEach(sheetName => {
      console.log(`Sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      if (data.length > 0) {
        console.log(`Headers: ${JSON.stringify(data[0])}`);
        console.log(`First row data: ${JSON.stringify(data[1])}`);
      } else {
        console.log('Empty sheet');
      }
    });
  } catch (error) {
    console.error(`Error reading ${file}:`, error.message);
  }
});
