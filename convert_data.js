const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'olive-gardens-spreadsheet files');
const file = 'Copy of Apartment rental tracker-2020.xlsx';
const workbook = xlsx.readFile(path.join(dir, file));

const records = [];

// Helper to format date
const excelDateToJSDate = (serial) => {
  if (!serial) return '';
  if (typeof serial === 'string') return serial; // already string
  const utc_days  = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;                                        
  const date_info = new Date(utc_value * 1000);
  return date_info.toISOString().split('T')[0];
};

// 1. Process Expenditures
const expSheet = workbook.Sheets['Expenditure'];
const expData = xlsx.utils.sheet_to_json(expSheet, { header: 1 });
// Starts at row 5 (index 4 is headers)
for (let i = 5; i < expData.length; i++) {
  const row = expData[i];
  if (!row || row.length === 0 || !row[2]) continue; // No category, probably empty
  if (row[0] === 'Total') continue;
  
  let dateStr = row[1] ? row[1].toString() : '2020-01-01'; // Fallback
  const category = row[2] || 'Other';
  const amount = parseFloat(row[3]) || 0;
  
  let unit = row[4] ? row[4].toString() : 'All Units';
  if (unit.toLowerCase().startsWith('unit ')) {
    const num = unit.split(' ')[1];
    unit = `Flat ${num}`;
  }

  if (amount > 0) {
    records.push({
      Date: dateStr.replace(/'/g, ''),
      Unit: unit,
      Category: category,
      Amount: amount,
      Type: 'Expense'
    });
  }
}

// 2. Process Income
const incomeSheet = workbook.Sheets['Income'];
const incomeData = xlsx.utils.sheet_to_json(incomeSheet, { header: 1 });
// Row index 27 (array index 26) is Jan, down to Dec (index 37)
for (let i = 27; i <= 38; i++) {
  const row = incomeData[i];
  if (!row) continue;
  
  const monthStr = row[0] || 'Unknown';
  if (monthStr === 'Total:' || !monthStr) continue;

  // 8 units
  for (let u = 1; u <= 8; u++) {
    const colBase = 1 + (u - 1) * 4;
    const dateStr = row[colBase] || `${monthStr.trim()} 2020`;
    const amount = parseFloat(row[colBase + 2]) || 0;
    
    if (amount > 0) {
      const unitName = `Flat ${u}`;
      records.push({
        Date: dateStr.toString().trim(),
        Unit: unitName,
        Category: 'Rent',
        Amount: amount,
        Type: 'Income'
      });
    }
  }
}

// Write to CSV
let csv = 'Date,Unit,Category,Amount,Type\n';
records.forEach(r => {
  // Ensure no commas break the CSV
  const date = `"${r.Date}"`;
  const unit = `"${r.Unit}"`;
  const category = `"${r.Category}"`;
  const amount = r.Amount;
  const type = `"${r.Type}"`;
  csv += `${date},${unit},${category},${amount},${type}\n`;
});

const outPath = path.join(__dirname, 'public', 'formatted_2020_data.csv');
fs.writeFileSync(outPath, csv);
console.log(`Successfully extracted ${records.length} records into public/formatted_2020_data.csv!`);
