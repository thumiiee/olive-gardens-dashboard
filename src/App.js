import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Dashboard from "./Dashboard";
import UnitsPage from "./UnitsPage";
import UnitDetailsPage from "./UnitDetailsPage";
import TransactionsPage from "./TransactionsPage";
import ExpensesPage from "./ExpensesPage";
import SettingsPage from "./SettingsPage";
import DataEntryPage from "./DataEntryPage";
import TenantsPage from "./TenantsPage";
import LoginPage from "./LoginPage";
import Layout from "./Layout";
import { DataProvider, useData } from "./DataContext";

// Define a modern, vibrant theme in Moss Green
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#588157", // Rich Moss Green
      light: "#A3B18A", // Light Sage
      dark: "#3A5A40", // Dark Forest Moss Green
    },
    secondary: {
      main: "#3A5A40",
    },
    error: {
      main: "#D9534F", // Soft Red for expenses
    },
    background: {
      default: "#EFF2EC", // Softer, reduced brightness light background to reduce glare
      paper: "#FCFDFB", // Slightly softened card background to reduce eye strain
    },
    text: {
      primary: "#2C3E35", // Deep forest green/grey for text
      secondary: "#6B7280",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 800,
      color: "#2C3E35",
    },
    h5: {
      fontWeight: 700,
      color: "#2C3E35",
    },
    h6: {
      fontWeight: 600,
      color: "#2C3E35",
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

function AppContent() {
  const { user } = useData();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/units" element={<UnitsPage />} />
          <Route path="/units/:unitId" element={<UnitDetailsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/data-entry" element={<DataEntryPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
