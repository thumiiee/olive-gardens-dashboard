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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert to JSON
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Map spreadsheet columns to our application state
        // Assuming columns: Date, Unit, Category, Amount, Type
        const formattedData = data.map(row => ({
          date: row.Date || row.date || new Date().toISOString().split('T')[0],
          unit: row.Unit || row.unit || 'Unknown',
          category: row.Category || row.category || 'Uncategorized',
          amount: parseFloat(row.Amount || row.amount) || 0,
          type: row.Type || row.type || 'Expense' // Income or Expense
        }));

        importData(formattedData);
        setSuccessMsg(`Successfully imported ${formattedData.length} records!`);
        setTimeout(() => setSuccessMsg(""), 4000);
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Failed to read file. Please ensure it is a valid Excel or CSV file with the correct columns (Date, Unit, Category, Amount, Type).");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // reset input
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
          Data Entry & Import
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Upload your financial spreadsheets or manually log new transactions.
        </Typography>
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
