import { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Button, TextField, 
  Select, MenuItem, InputLabel, FormControl, Grid, Alert
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import { useData } from './DataContext';

function DataEntryPage() {
  const { addTransaction, importData, clearData } = useData();
  const [successMsg, setSuccessMsg] = useState("");
  
  // Manual Entry State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    unit: '',
    category: '',
    amount: '',
    type: 'Expense'
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!formData.unit || !formData.amount || !formData.category) return;
    
    addTransaction(formData);
    setSuccessMsg("Transaction added successfully!");
    setFormData({ ...formData, amount: '', category: '' }); // reset some fields
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Helper function to parse Excel serial dates and formatted date strings
  const parseDateString = (val) => {
    if (val === undefined || val === null || val === '') return '';
    if (typeof val === 'number') {
      // Excel serial number
      const utc_days = Math.floor(val - 25569);
      const utc_value = utc_days * 86400;
      const date_info = new Date(utc_value * 1000);
      return date_info.toISOString().split('T')[0];
    }
    const str = String(val).trim();
    if (!str) return '';

    // Check for DD/MM/YY or DD/MM/YYYY
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        let year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          if (parts[2].length === 2) {
            year = year < 50 ? 2000 + year : 1900 + year;
          }
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
    }

    // Fallback to standard JS Date parsing
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }

    return str; // Return as-is if all else fails
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        let formattedData = [];
        let formatDetected = 'Standard';

        // 1. Detect if it's the Rental Tracker Format (has Income and Expenditure sheets)
        const sheetNamesLower = wb.SheetNames.map(s => s.toLowerCase());
        const hasIncomeSheet = sheetNamesLower.includes('income');
        const hasExpenditureSheet = sheetNamesLower.includes('expenditure');

        // 2. Detect if it's the Bank Statement Format (has Bank Statement sheet)
        const hasBankStatementSheet = sheetNamesLower.includes('bank statement');

        if (hasIncomeSheet || hasExpenditureSheet) {
          formatDetected = 'Rental Tracker';
          
          // Parse Expenditure (Expenses)
          if (hasExpenditureSheet) {
            const expSheetName = wb.SheetNames.find(s => s.toLowerCase() === 'expenditure');
            const expSheet = wb.Sheets[expSheetName];
            const expData = XLSX.utils.sheet_to_json(expSheet, { header: 1 });
            
            // Starts at row 6 (index 5)
            for (let i = 5; i < expData.length; i++) {
              const row = expData[i];
              if (!row || row.length === 0 || !row[2]) continue; // Skip if no category
              if (row[0] === 'Total') continue;
              
              const date = parseDateString(row[1]) || new Date().toISOString().split('T')[0];
              const category = String(row[2]).trim() || 'Other';
              const amount = parseFloat(row[3]) || 0;
              
              let unit = row[4] ? String(row[4]).trim() : 'All Units';
              if (unit.toLowerCase().startsWith('unit ')) {
                const num = unit.split(' ')[1];
                unit = `Flat ${num}`;
              }

              if (amount > 0) {
                formattedData.push({
                  date,
                  unit,
                  category,
                  amount,
                  type: 'Expense'
                });
              }
            }
          }

          // Parse Income (Rent payments)
          if (hasIncomeSheet) {
            const incomeSheetName = wb.SheetNames.find(s => s.toLowerCase() === 'income');
            const incomeSheet = wb.Sheets[incomeSheetName];
            const incomeData = XLSX.utils.sheet_to_json(incomeSheet, { header: 1 });
            
            // Monthly rows from index 27 (January) to 38 (December)
            for (let i = 27; i <= 38; i++) {
              const row = incomeData[i];
              if (!row) continue;
              
              const monthStr = row[0] ? String(row[0]).trim() : '';
              if (monthStr === 'Total:' || !monthStr) continue;

              // Loop through 8 rental units
              for (let u = 1; u <= 8; u++) {
                const colBase = 1 + (u - 1) * 4;
                const dateVal = row[colBase];
                const dateStr = dateVal ? parseDateString(dateVal) : parseDateString(`${monthStr} 2020`);
                const amount = parseFloat(row[colBase + 2]) || 0;
                
                if (amount > 0) {
                  formattedData.push({
                    date: dateStr,
                    unit: `Flat ${u}`,
                    category: 'Rent',
                    amount: amount,
                    type: 'Income'
                  });
                }
              }
            }
          }
        } 
        else if (hasBankStatementSheet) {
          formatDetected = 'Bank Statement';
          const statementSheetName = wb.SheetNames.find(s => s.toLowerCase() === 'bank statement');
          const statementSheet = wb.Sheets[statementSheetName];
          const data = XLSX.utils.sheet_to_json(statementSheet, { header: 1 });
          
          // Find the header row dynamically
          let headerIndex = -1;
          for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (row && row.includes('Date') && row.includes('Description') && row.includes('Amount')) {
              headerIndex = i;
              break;
            }
          }

          const headerRow = headerIndex !== -1 ? data[headerIndex] : ['Date', 'Description', 'Amount'];
          const dateIdx = headerRow.indexOf('Date') !== -1 ? headerRow.indexOf('Date') : 0;
          const descIdx = headerRow.indexOf('Description') !== -1 ? headerRow.indexOf('Description') : 1;
          const amountIdx = headerRow.indexOf('Amount') !== -1 ? headerRow.indexOf('Amount') : 6;

          const startRow = headerIndex !== -1 ? headerIndex + 1 : 6;

          for (let i = startRow; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;
            
            const dateVal = row[dateIdx];
            const descVal = row[descIdx];
            const amountVal = row[amountIdx];
            
            if (!dateVal || amountVal === undefined || amountVal === null) continue;
            
            const desc = descVal ? String(descVal).trim() : '';
            if (desc.toLowerCase().includes('opening balance') || desc.toLowerCase().includes('closing balance') || desc.toLowerCase() === 'total') {
              continue;
            }

            const rawAmount = parseFloat(amountVal);
            if (!rawAmount || isNaN(rawAmount)) continue;

            const date = parseDateString(dateVal);
            const type = rawAmount < 0 ? 'Expense' : 'Income';
            const amount = Math.abs(rawAmount);

            // Parse Unit from Description
            let unit = 'All Units';
            const flatMatch = desc.match(/flat\s*([1-8])/i);
            const unitMatch = desc.match(/unit\s*([1-8])/i);
            if (flatMatch) {
              unit = `Flat ${flatMatch[1]}`;
            } else if (unitMatch) {
              unit = `Flat ${unitMatch[1]}`;
            } else if (desc.toLowerCase().includes('airbnb')) {
              unit = 'Flat 8';
            }

            const category = desc.charAt(0).toUpperCase() + desc.slice(1);

            formattedData.push({
              date,
              unit,
              category,
              amount,
              type
            });
          }
        } 
        else {
          // Fallback to Standard Format
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          formattedData = data.map(row => ({
            date: parseDateString(row.Date || row.date) || new Date().toISOString().split('T')[0],
            unit: row.Unit || row.unit || 'Unknown',
            category: row.Category || row.category || 'Uncategorized',
            amount: parseFloat(row.Amount || row.amount) || 0,
            type: row.Type || row.type || 'Expense'
          }));
        }

        if (formattedData.length === 0) {
          alert("No valid transactions found in the uploaded file.");
          return;
        }

        importData(formattedData);
        setSuccessMsg(`Successfully imported ${formattedData.length} records! (${formatDetected} Format)`);
        setTimeout(() => setSuccessMsg(""), 5000);
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Failed to read file. Please ensure it is a valid Excel or CSV file.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // reset input
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: '12px', color: 'primary.dark', display: 'flex' }}>
          <CloudUploadIcon fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
            Data Entry & Import
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Upload your financial spreadsheets or manually log new transactions.
          </Typography>
        </Box>
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

      <Grid container spacing={4}>
        {/* Bulk Upload Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Bulk Upload Spreadsheet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={4}>
                Upload an .xlsx or .csv file. Make sure your columns are labeled: 
                <strong> Date, Unit, Category, Amount, Type</strong>.
              </Typography>
              
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                size="large"
                sx={{ px: 4, py: 1.5, borderRadius: '8px' }}
              >
                Upload File
                <input
                  type="file"
                  hidden
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileUpload}
                />
              </Button>
              
              <Box mt={4} pt={4} width="100%" borderTop="1px solid #E5E7EB">
                <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<DownloadIcon />} 
                    href="/template.csv" 
                    download
                  >
                    Download Template
                  </Button>
                </Box>
                 <Typography variant="body2" color="error" mb={2}>
                   Danger Zone
                 </Typography>
                 <Button variant="outlined" color="error" onClick={() => {
                   if(window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                     clearData();
                     setSuccessMsg("All data cleared.");
                   }
                 }}>
                   Clear All Data
                 </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Manual Entry Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Manual Entry
              </Typography>
              
              <form onSubmit={handleManualSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth label="Date" type="date" name="date"
                      value={formData.date} onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }} required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Type</InputLabel>
                      <Select name="type" value={formData.type} label="Type" onChange={handleInputChange}>
                        <MenuItem value="Income">Income</MenuItem>
                        <MenuItem value="Expense">Expense</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth label="Unit (e.g. Flat 1, Airbnb)" name="unit"
                      value={formData.unit} onChange={handleInputChange} required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth label="Amount" type="number" name="amount" inputProps={{ min: 0, step: "0.01" }}
                      value={formData.amount} onChange={handleInputChange} required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth label="Category (e.g. Rent, Repairs, Utilities)" name="category"
                      value={formData.category} onChange={handleInputChange} required
                    />
                  </Grid>
                  <Grid item xs={12} mt={2}>
                    <Button type="submit" variant="contained" color="primary" fullWidth size="large">
                      Add Transaction
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DataEntryPage;
