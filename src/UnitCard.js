import { Card, CardContent, Typography, Box, Divider, CardActionArea } from "@mui/material";
import { Link } from "react-router-dom";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

function UnitCard({ id, name, income, expenses, profit }) {
  // Simple check for profitability
  const isProfitable = parseFloat(profit.toString().replace(/[^0-9.-]+/g,"")) >= 0;

  return (
    <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardActionArea component={Link} to={`/units/${encodeURIComponent(id)}`} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {name}
        </Typography>
        
        <Box sx={{ my: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Income</Typography>
            <Typography variant="body1" fontWeight={500}>{income}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Expenses</Typography>
            <Typography variant="body1" fontWeight={500}>{expenses}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Net Profit</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', color: isProfitable ? 'secondary.main' : 'error.main' }}>
            {isProfitable ? <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> : <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />}
            <Typography variant="h6" fontWeight={700}>
              {profit}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default UnitCard;
