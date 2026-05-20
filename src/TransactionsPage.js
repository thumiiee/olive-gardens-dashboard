import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from "@mui/material";
import { useData } from "./DataContext";

function TransactionsPage() {
  const { transactions, isLoaded } = useData();

  if (!isLoaded) {
    return <Typography>Loading transactions...</Typography>;
  }

  // Sort newest first
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
          All Transactions Ledger
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          A master list of all income and expenses across every property.
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'primary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>Unit</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>Type</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'white' }}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTransactions.length > 0 ? sortedTransactions.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>{t.date}</TableCell>
                <TableCell>{t.unit}</TableCell>
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
                <TableCell colSpan={5} align="center">No transactions found. Upload your spreadsheet in Data Entry.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default TransactionsPage;
