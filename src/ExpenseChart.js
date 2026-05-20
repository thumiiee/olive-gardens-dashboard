import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { useData } from "./DataContext";

ChartJS.register(ArcElement, Tooltip, Legend);

function ExpenseChart() {
  const { transactions } = useData();

  const expenseStats = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const labels = Object.keys(expenseStats);
  const dataValues = Object.values(expenseStats);
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: "'Inter', sans-serif", size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        bodyFont: { size: 13, family: "'Inter', sans-serif" }
      }
    },
    cutout: '65%' // This makes it a donut chart, looks more modern than pie
  };

  const data = {
    labels: labels.length ? labels : ["No Expenses"],
    datasets: [
      {
        data: dataValues.length ? dataValues : [1],
        backgroundColor: [
          "#A3B18A", // Sage
          "#D9534F", // Soft Red
          "#588157", // Moss Green
          "#F59E0B", // Amber
          "#8B5CF6", // Violet
          "#EC4899", // Pink
        ],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Expense Distribution
        </Typography>
        <Box sx={{ flexGrow: 1, minHeight: '300px', display: 'flex', justifyContent: 'center' }}>
          <Pie options={options} data={data} />
        </Box>
      </CardContent>
    </Card>
  );
}

export default ExpenseChart;
