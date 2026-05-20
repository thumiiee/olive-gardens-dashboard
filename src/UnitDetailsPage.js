import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useData } from './DataContext';
import SummaryCard from './SummaryCard';

function UnitDetailsPage() {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const { transactions, unitMetadata, updateUnitMetadata } = useData();

  const decodedUnitId = decodeURIComponent(unitId);
  
  // Load metadata for this unit (custom name, resident, email)
  const metadata = unitMetadata[decodedUnitId] || { customName: '', resident: '', email: '' };
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(metadata);

  const handleSave = () => {
    updateUnitMetadata(decodedUnitId, formData);
    setEditMode(false);
  };

  // Filter transactions for this specific unit
  const unitTransactions = transactions
    .filter(t => t.unit === decodedUnitId)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first

  const totalIncome = unitTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = unitTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const totalProfit = totalIncome - totalExpenses;

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <Box>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/units')}
        sx={{ mb: 3 }}
      >
        Back to Units
      </Button>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            {metadata.customName || decodedUnitId}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Original ID: {decodedUnitId} • Resident: {metadata.resident || 'Not Assigned'}
          </Typography>
          {metadata.email && (
            <Typography variant="body2" color="primary">
              <a href={`mailto:${metadata.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {metadata.email}
              </a>
            </Typography>
          )}
        </Box>
        <Button variant={editMode ? "outlined" : "contained"} onClick={() => editMode ? handleSave() : setEditMode(true)}>
          {editMode ? "Save Details" : "Edit Unit Details"}
        </Button>
      </Box>

      {editMode && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth label="Custom Unit Name" 
                  value={formData.customName} 
                  onChange={(e) => setFormData({...formData, customName: e.target.value})}
                  placeholder={decodedUnitId}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  fullWidth label="Resident Name" 
                  value={formData.resident} 
                  onChange={(e) => setFormData({...formData, resident: e.target.value})}
                  placeholder="e.g. John Doe"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  fullWidth label="Resident Email" 
                  type="email"
                  value={formData.email || ''} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="e.g. john@example.com"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <SummaryCard title="Total Income" value={formatCurrency(totalIncome)} color="#588157" bgColor="#E2E8DC" />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard title="Total Expenses" value={formatCurrency(totalExpenses)} color="#D9534F" bgColor="#F8E9E8" />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard title="Net Profit" value={formatCurrency(totalProfit)} color="#A3B18A" bgColor="#F1F4EB" />
        </Grid>
      </Grid>

      {/* Transactions Table */}
      <Typography variant="h6" fontWeight={600} mb={2}>Transaction History</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'primary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>Type</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'white' }}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {unitTransactions.length > 0 ? unitTransactions.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>{t.date}</TableCell>
                <TableCell>{t.category}</TableCell>
                <TableCell>
                  <Chip 
                    label={t.type} 
                    size="small" 
                    color={t.type === 'Income' ? 'success' : 'error'} 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 500 }}>
                  {formatCurrency(t.amount)}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} align="center">No transactions found for this unit.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default UnitDetailsPage;
