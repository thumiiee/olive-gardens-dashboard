import { Box, Typography, Card, CardContent, Button, Switch, FormControlLabel } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useData } from "./DataContext";

function SettingsPage() {
  const { logout } = useData();

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: '12px', color: 'primary.dark', display: 'flex' }}>
          <SettingsIcon fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
            Settings
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your dashboard preferences and account settings.
          </Typography>
        </Box>
      </Box>

      <Card sx={{ maxWidth: 600, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Notifications
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel 
              control={<Switch defaultChecked color="primary" />} 
              label="Email alerts for new expenses" 
            />
            <FormControlLabel 
              control={<Switch defaultChecked color="primary" />} 
              label="Monthly profit summary reports" 
            />
            <FormControlLabel 
              control={<Switch color="primary" />} 
              label="SMS alerts for maintenance requests" 
            />
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ maxWidth: 600 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Account
          </Typography>
          <Button variant="contained" color="primary" sx={{ mr: 2 }}>
            Update Profile
          </Button>
          <Button variant="outlined" color="error" onClick={logout}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SettingsPage;
