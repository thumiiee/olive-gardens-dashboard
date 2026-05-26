const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'olive-gardens-spreadsheet files');
const file = 'Dulles Initiative - Bank Reconciliation Comments.xlsx';
const workbook = xlsx.readFile(path.join(dir, file));

const statementSheet = workbook.Sheets['Bank Statement'];
const data = xlsx.utils.sheet_to_json(statementSheet, { header: 1 });
console.log(`\nBank Statement Rows 5-25:`);
for (let i = 5; i < Math.min(25, data.length); i++) {
  console.log(JSON.stringify(data[i]));
}
