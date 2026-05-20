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
import Layout from "./Layout";
import { DataProvider } from "./DataContext";

// Define a modern, vibrant theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#A3B18A", // Sage Green
      light: "#C0CDA5",
      dark: "#7A8D68",
    },
    secondary: {
      main: "#588157", // Darker Moss Green for contrast
    },
    error: {
      main: "#D9534F", // Soft Red for expenses
    },
    background: {
      default: "#F8FAF6", // Very light, warm white/sage tint background
      paper: "#FFFFFF",
    },
    text: {
      primary: "#344E41", // Very dark green/grey for text
      secondary: "#6B7280",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/units" element={<UnitsPage />} />
              <Route path="/units/:unitId" element={<UnitDetailsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/data-entry" element={<DataEntryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Layout>
        </Router>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
