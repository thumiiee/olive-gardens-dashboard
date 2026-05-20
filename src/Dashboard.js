import { Grid, Typography, Box } from "@mui/material";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HomeIcon from '@mui/icons-material/Home';

import SummaryCard from "./SummaryCard";
import Chart from "./Chart"; // IncomeExpenseChart
import UnitChart from "./UnitChart"; // Bar chart
import { useData } from "./DataContext";

function Dashboard() {
  const { transactions, isLoaded, error } = useData();

  if (!isLoaded) {
    return <Typography>Loading dashboard data...</Typography>;
  }

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const overallProfit = totalIncome - totalExpenses;
  
  const airbnbIncome = transactions.filter(t => t.type === 'Income' && t.unit === 'Airbnb').reduce((sum, t) => sum + t.amount, 0);
  const airbnbExpenses = transactions.filter(t => t.type === 'Expense' && t.unit === 'Airbnb').reduce((sum, t) => sum + t.amount, 0);
  const airbnbProfit = airbnbIncome - airbnbExpenses;

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back! Here's what's happening with your properties today.
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Total Income" 
            value={formatCurrency(totalIncome)} 
            icon={<AttachMoneyIcon />} 
            color="#588157" // Moss Green
            bgColor="#E2E8DC"
            linkTo="/transactions"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Total Expenses" 
            value={formatCurrency(totalExpenses)} 
            icon={<MoneyOffIcon />} 
            color="#D9534F" // Soft Red
            bgColor="#F8E9E8"
            linkTo="/expenses"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Overall Profit" 
            value={formatCurrency(overallProfit)} 
            icon={<TrendingUpIcon />} 
            color="#A3B18A" // Sage Green
            bgColor="#F1F4EB"
            linkTo="/units"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Airbnb Profit" 
            value={formatCurrency(airbnbProfit)} 
            icon={<HomeIcon />} 
            color="#8A9A5B" // Olive/Sage variation
            bgColor="#ECEEE7"
            linkTo="/units/Airbnb"
          />
        </Grid>
      </Grid>

      {/* Charts section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7} lg={8}>
          <Chart />
        </Grid>
        <Grid item xs={12} md={5} lg={4}>
          <UnitChart />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
