import { Box, Typography, Grid } from "@mui/material";
import UnitCard from "./UnitCard";
import { useData } from "./DataContext";
import HomeWorkIcon from "@mui/icons-material/HomeWork";

function UnitsPage() {
  const { transactions, unitMetadata, isLoaded, error } = useData();

  if (!isLoaded) {
    return <Typography>Loading units...</Typography>;
  }

  // Aggregate data by unit
  const unitStats = transactions.reduce((acc, t) => {
    if (!acc[t.unit]) {
      acc[t.unit] = { income: 0, expenses: 0 };
    }
    if (t.type === 'Income') acc[t.unit].income += t.amount;
    if (t.type === 'Expense') acc[t.unit].expenses += t.amount;
    return acc;
  }, {});

  // The default units that should always appear
  const defaultUnits = ["Flat 1", "Flat 2", "Flat 3", "Flat 4", "Flat 5", "Flat 6", "Flat 7", "Flat 8"];
  
  // Also include any dynamically discovered units from the spreadsheet not in our default list
  const allUnitNames = Array.from(new Set([...defaultUnits, ...Object.keys(unitStats)]));

  const units = allUnitNames.map(unitName => {
    const stats = unitStats[unitName] || { income: 0, expenses: 0 };
    return {
      name: unitName,
      income: stats.income,
      expenses: stats.expenses,
      profit: stats.income - stats.expenses
    };
  });

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: '12px', color: 'primary.dark', display: 'flex' }}>
          <HomeWorkIcon fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
            Units Performance
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Detailed breakdown of income and expenses for each flat and the Airbnb.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {units.length > 0 ? units.map((unit, index) => {
          const customName = unitMetadata[unit.name]?.customName || unit.name;
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <UnitCard 
                id={unit.name}
                name={customName} 
                income={formatCurrency(unit.income)} 
                expenses={formatCurrency(unit.expenses)} 
                profit={formatCurrency(unit.profit)} 
              />
            </Grid>
          );
        }) : (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">No unit data available. Upload your spreadsheets in the Data Entry page.</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default UnitsPage;
