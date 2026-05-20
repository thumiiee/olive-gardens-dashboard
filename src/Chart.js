import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Card, CardContent, Typography } from "@mui/material";
import { useData } from "./DataContext";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function IncomeExpenseChart() {
  const { transactions } = useData();

  // Aggregate by month (e.g. "2023-10")
  const monthlyData = transactions.reduce((acc, t) => {
    // extract YYYY-MM
    const month = t.date.substring(0, 7); 
    if (!acc[month]) acc[month] = { income: 0, expenses: 0 };
    if (t.type === 'Income') acc[month].income += t.amount;
    if (t.type === 'Expense') acc[month].expenses += t.amount;
    return acc;
  }, {});

  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyData).sort();
  
  // Format labels like "Oct 23"
  const labels = sortedMonths.map(m => {
    const d = new Date(m + "-01T00:00:00");
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  });

  const incomeData = sortedMonths.map(m => monthlyData[m].income);
  const expenseData = sortedMonths.map(m => monthlyData[m].expenses);
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 14, family: "'Inter', sans-serif" },
        bodyFont: { size: 13, family: "'Inter', sans-serif" }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
          drawBorder: false,
        },
        ticks: {
          font: { family: "'Inter', sans-serif" }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: { family: "'Inter', sans-serif" }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const data = {
    labels: labels.length ? labels : ["No Data"],
    datasets: [
      {
        label: "Income",
        data: incomeData.length ? incomeData : [0],
        borderColor: "#A3B18A", // Sage Green
        backgroundColor: "rgba(163, 177, 138, 0.2)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#A3B18A",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: "Expenses",
        data: expenseData.length ? expenseData : [0],
        borderColor: "#D9534F", // Soft Red
        backgroundColor: "rgba(217, 83, 79, 0.2)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#D9534F",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Income vs Expenses
        </Typography>
        <div style={{ flexGrow: 1, minHeight: '300px' }}>
          <Line options={options} data={data} />
        </div>
      </CardContent>
    </Card>
  );
}

export default IncomeExpenseChart;
