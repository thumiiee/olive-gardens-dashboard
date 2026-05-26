import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent, Typography } from "@mui/material";
import { useData } from "./DataContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function UnitChart() {
  const { transactions } = useData();

  // Aggregate profit by unit
  const unitStats = transactions.reduce((acc, t) => {
    if (!acc[t.unit]) acc[t.unit] = { income: 0, expenses: 0 };
    if (t.type === 'Income') acc[t.unit].income += t.amount;
    if (t.type === 'Expense') acc[t.unit].expenses += t.amount;
    return acc;
  }, {});

  const defaultUnits = ["Flat 1", "Flat 2", "Flat 3", "Flat 4", "Flat 5", "Flat 6", "Flat 7", "Flat 8"];
  const allUnitNames = Array.from(new Set([...defaultUnits, ...Object.keys(unitStats)]));

  const labels = allUnitNames;
  const profits = labels.map(l => {
    const stats = unitStats[l] || { income: 0, expenses: 0 };
    return stats.income - stats.expenses;
  });
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend since we only have one dataset
      },
      tooltip: {
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
    }
  };

  const data = {
    labels: labels.length ? labels : ["No Data"],
    datasets: [
      {
        label: "Profit",
        data: profits.length ? profits : [0],
        backgroundColor: labels.map(l => (l === "Flat 8" || l.toLowerCase() === "airbnb") ? "#A3B18A" : "#C0CDA5"), // Flat 8 / Airbnb in Darker Sage Green
        borderRadius: 6,
      }
    ]
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Profit by Unit
        </Typography>
        <div style={{ flexGrow: 1, minHeight: '300px' }}>
          <Bar options={options} data={data} />
        </div>
      </CardContent>
    </Card>
  );
}

export default UnitChart;
