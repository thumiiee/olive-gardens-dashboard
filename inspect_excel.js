const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'olive-gardens-spreadsheet files');
const file = 'Copy of Apartment rental tracker-2020.xlsx';
const workbook = xlsx.readFile(path.join(dir, file));

const incomeSheet = workbook.Sheets['Income'];
const incomeData = xlsx.utils.sheet_to_json(incomeSheet, { header: 1 });
console.log(`\nIncome Rows 25-50:`);
for (let i = 25; i < Math.min(50, incomeData.length); i++) {
  console.log(JSON.stringify(incomeData[i]));
}
