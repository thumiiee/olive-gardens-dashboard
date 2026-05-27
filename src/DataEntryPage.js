import { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Button, TextField, 
  Select, MenuItem, InputLabel, FormControl, Grid, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Paper, Chip
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import WarningIcon from '@mui/icons-material/Warning';
import * as XLSX from 'xlsx';
import { useData } from './DataContext';

function DataEntryPage() {
  const { addTransaction, importData, clearData, uploads, addUploadRecord } = useData();
  const [successMsg, setSuccessMsg] = useState("");
  
  // State for duplicate warnings and pending imports
  const [openDialog, setOpenDialog] = useState(false);
  const [pendingImport, setPendingImport] = useState(null);
  
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

  // Helper function to compute SHA-256 hash of a file
  const computeFileHash = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (e) {
      console.error("Error hashing file:", e);
      // Fast deterministic fallback if crypto.subtle is blocked (non-secure context)
      let hash = 0;
      const str = file.name + file.size + file.lastModified;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return 'fallback-' + Math.abs(hash).toString(16);
    }
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

        // Compute hash and check for duplicate before importing
        computeFileHash(file).then((fileHash) => {
          const duplicate = uploads ? uploads.find(u => u.file_hash === fileHash) : null;
          
          if (duplicate) {
            setPendingImport({
              data: formattedData,
              filename: file.name,
              rowCount: formattedData.length,
              hash: fileHash,
              format: formatDetected,
              duplicateInfo: duplicate
            });
            setOpenDialog(true);
          } else {
            importData(formattedData);
            addUploadRecord(file.name, formattedData.length, fileHash);
            setSuccessMsg(`Successfully imported ${formattedData.length} records! (${formatDetected} Format)`);
            setTimeout(() => setSuccessMsg(""), 5000);
          }
        });
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Failed to read file. Please ensure it is a valid Excel or CSV file.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // reset input
  };

  const handleConfirmImport = () => {
    if (pendingImport) {
      const { data, filename, rowCount, hash, format } = pendingImport;
      importData(data);
      addUploadRecord(filename, rowCount, hash);
      setSuccessMsg(`Successfully imported ${rowCount} records! (${format} Format)`);
      setTimeout(() => setSuccessMsg(""), 5000);
    }
    setOpenDialog(false);
    setPendingImport(null);
  };

  const handleCancelImport = () => {
    setOpenDialog(false);
    setPendingImport(null);
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

      {/* Upload History Section */}
      <Box mt={4}>
        <Card sx={{ border: '1px solid rgba(88, 129, 87, 0.12)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: '8px', color: 'primary.dark', display: 'flex', opacity: 0.85 }}>
                <HistoryIcon />
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Spreadsheet Upload History
              </Typography>
            </Box>
            
            {!uploads || uploads.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center', bgcolor: 'rgba(239, 242, 236, 0.5)', borderRadius: '12px', border: '1px dashed rgba(88, 129, 87, 0.2)' }}>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  No spreadsheets uploaded yet.
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Import an Excel or CSV file to start tracking your upload history.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 'none', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'rgba(88, 129, 87, 0.05)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 650, color: 'text.primary' }}>Filename</TableCell>
                      <TableCell sx={{ fontWeight: 650, color: 'text.primary' }}>Upload Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 650, color: 'text.primary' }}>Rows Imported</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 650, color: 'text.primary' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {uploads.map((upload, idx) => (
                      <TableRow key={upload.id || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {upload.filename}
                        </TableCell>
                        <TableCell color="text.secondary">
                          {upload.uploaded_at ? new Date(upload.uploaded_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {upload.row_count}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label="Imported Successfully" 
                            size="small" 
                            sx={{ 
                              bgcolor: 'rgba(88, 129, 87, 0.12)', 
                              color: 'primary.dark', 
                              fontWeight: 600,
                              borderRadius: '6px'
                            }} 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Duplicate Import Warning Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCancelImport}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1.5,
            maxWidth: '480px'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#D9534F', fontWeight: 700 }}>
          <WarningIcon sx={{ fontSize: 28 }} />
          Duplicate Import Warning
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, color: 'text.primary', fontWeight: 500 }}>
            The spreadsheet file you uploaded appears to be a duplicate.
          </DialogContentText>
          <DialogContentText variant="body2" sx={{ bgcolor: 'rgba(217, 83, 79, 0.05)', p: 2, borderRadius: '8px', border: '1px solid rgba(217, 83, 79, 0.15)', mb: 2, color: 'text.primary' }}>
            <strong>Filename:</strong> {pendingImport?.filename}<br />
            <strong>Records in file:</strong> {pendingImport?.rowCount}<br />
            <strong>Previous Import:</strong> {pendingImport?.duplicateInfo?.uploaded_at ? new Date(pendingImport.duplicateInfo.uploaded_at).toLocaleString() : 'N/A'}
          </DialogContentText>
          <DialogContentText variant="body2" color="text.secondary">
            Importing this file again may result in duplicate records in the database. Are you sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleCancelImport} variant="outlined" color="inherit" sx={{ borderRadius: '8px', px: 2.5 }}>
            Cancel Import
          </Button>
          <Button onClick={handleConfirmImport} variant="contained" color="error" sx={{ borderRadius: '8px', px: 2.5 }}>
            Import Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DataEntryPage;
