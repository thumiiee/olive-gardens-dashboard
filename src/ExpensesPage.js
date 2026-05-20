import { Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemText, ListItemIcon, Divider } from "@mui/material";
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HandymanIcon from '@mui/icons-material/Handyman';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import ExpenseChart from "./ExpenseChart"; // The pie chart
import { useData } from "./DataContext";

function ExpensesPage() {
  const { transactions } = useData();

  // Aggregate expenses by category
  const expenses = transactions.filter(t => t.type === 'Expense');
  const expenseStats = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  // For nice icons, we can try to guess based on names or use a default
  const getIconForCategory = (categoryName) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('repair') || lower.includes('maint')) return <HomeRepairServiceIcon sx={{ color: "#4F46E5" }}/>;
    if (lower.includes('contract')) return <HandymanIcon sx={{ color: "#F59E0B" }}/>;
    if (lower.includes('util') || lower.includes('water') || lower.includes('electric')) return <WaterDropIcon sx={{ color: "#EC4899" }}/>;
    if (lower.includes('tax')) return <AccountBalanceIcon sx={{ color: "#8B5CF6" }}/>;
    return <ReceiptLongIcon sx={{ color: "#10B981" }}/>; // Default
  };

  const expenseCategories = Object.entries(expenseStats)
    .sort(([,a], [,b]) => b - a) // sort by amount descending
    .map(([name, amount], id) => ({
      id, name, amount, icon: getIconForCategory(name)
    }));
    
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
          Expense Tracking
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Breakdown of your property expenses across categories.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <ExpenseChart />
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Expense Categories
              </Typography>
              <List>
                {expenseCategories.length > 0 ? expenseCategories.map((expense, index) => (
                  <Box key={expense.id}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemIcon>
                        {expense.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body1" fontWeight={500}>{expense.name}</Typography>} 
                      />
                      <Typography variant="h6" fontWeight={600}>{formatCurrency(expense.amount)}</Typography>
                    </ListItem>
                    {index < expenseCategories.length - 1 && <Divider component="li" />}
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary">No expenses found.</Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ExpensesPage;
