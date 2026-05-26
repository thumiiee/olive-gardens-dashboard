import { useState } from "react";
import { 
  Box, Typography, Grid, Card, CardContent, Button, Chip,
  Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Tab, Tabs, Divider
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EditIcon from "@mui/icons-material/Edit";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { useData } from "./DataContext";

// Rich fallback tenant details for mock/initial experience
const DEFAULT_TENANTS = {
  "Flat 1": { resident: "John Doe", email: "john.doe@email.com", phone: "+1 555-0101", rent: 1200, leaseStart: "2024-01-01", leaseEnd: "2025-01-01" },
  "Flat 2": { resident: "Jane Smith", email: "jane.smith@email.com", phone: "+1 555-0102", rent: 1350, leaseStart: "2024-03-01", leaseEnd: "2025-03-01" },
  "Flat 3": { resident: "Bob Johnson", email: "bob.johnson@email.com", phone: "+1 555-0103", rent: 1400, leaseStart: "2024-05-15", leaseEnd: "2025-05-15" },
  "Flat 4": { resident: "Alice Brown", email: "alice.brown@email.com", phone: "+1 555-0104", rent: 1150, leaseStart: "2023-06-01", leaseEnd: "2024-06-01" },
  "Flat 5": { resident: "Charlie Green", email: "charlie.green@email.com", phone: "+1 555-0105", rent: 1250, leaseStart: "2024-02-01", leaseEnd: "2025-02-01" },
  "Flat 6": { resident: "Diana Prince", email: "diana.prince@email.com", phone: "+1 555-0106", rent: 1500, leaseStart: "2024-08-01", leaseEnd: "2025-08-01" },
  "Flat 7": { resident: "Evan Wright", email: "evan.wright@email.com", phone: "+1 555-0107", rent: 1300, leaseStart: "2024-10-01", leaseEnd: "2025-10-01" },
  "Flat 8": { resident: "Airbnb Guests", email: "airbnb@email.com", phone: "+1 555-0108", rent: 1800, leaseStart: "2024-01-01", leaseEnd: "2026-12-31" }
};

function TenantsPage() {
  const { unitMetadata, updateUnitMetadata } = useData();
  const [filterTab, setFilterTab] = useState(0);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editForm, setEditForm] = useState({
    resident: "",
    email: "",
    phone: "",
    rent: "",
    leaseStart: "",
    leaseEnd: ""
  });

  const getTenantDetails = (flatId) => {
    // Merge database state (unitMetadata) with rich local fallbacks
    const dbValue = unitMetadata[flatId] || {};
    const defaultValue = DEFAULT_TENANTS[flatId] || {
      resident: "Vacant",
      email: "-",
      phone: "-",
      rent: 0,
      leaseStart: "",
      leaseEnd: ""
    };

    return {
      resident: dbValue.resident || defaultValue.resident,
      email: dbValue.email || defaultValue.email,
      phone: dbValue.phone || defaultValue.phone,
      rent: dbValue.rent || defaultValue.rent,
      leaseStart: dbValue.leaseStart || defaultValue.leaseStart,
      leaseEnd: dbValue.leaseEnd || defaultValue.leaseEnd
    };
  };

  const flats = Array.from({ length: 8 }, (_, i) => `Flat ${i + 1}`);

  const handleTabChange = (event, newValue) => {
    setFilterTab(newValue);
  };

  const handleOpenEdit = (flatId) => {
    const details = getTenantDetails(flatId);
    setEditingUnit(flatId);
    setEditForm({
      resident: details.resident,
      email: details.email,
      phone: details.phone,
      rent: details.rent,
      leaseStart: details.leaseStart,
      leaseEnd: details.leaseEnd
    });
  };

  const handleCloseEdit = () => {
    setEditingUnit(null);
  };

  const handleFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!editingUnit) return;
    
    // Save to DataContext (which pushes upsert to Supabase)
    await updateUnitMetadata(editingUnit, {
      resident: editForm.resident,
      email: editForm.email,
      phone: editForm.phone,
      rent: parseFloat(editForm.rent) || 0,
      leaseStart: editForm.leaseStart,
      leaseEnd: editForm.leaseEnd,
      customName: editingUnit
    });

    handleCloseEdit();
  };

  const getLeaseStatus = (leaseEnd) => {
    if (!leaseEnd) return { label: "Vacant", color: "default" };
    const today = new Date().toISOString().split("T")[0];
    if (leaseEnd < today) {
      return { label: "Expired", color: "error" };
    }
    return { label: "Active", color: "success" };
  };

  // Filter flats based on active tab
  const filteredFlats = flats.filter(flatId => {
    const details = getTenantDetails(flatId);
    const status = getLeaseStatus(details.leaseEnd);

    if (filterTab === 0) return true; // All
    if (filterTab === 1) return status.label === "Active"; // Active
    if (filterTab === 2) return status.label === "Expired"; // Expired
    if (filterTab === 3) return details.resident === "Vacant" || flatId === "Flat 8"; // Short-term/Vacant
    return true;
  });

  return (
    <Box>
      {/* Header Consistency */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: '12px', color: 'primary.dark', display: 'flex' }}>
          <HomeWorkIcon fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
            Tenant Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage active occupant details, monthly rents, and lease terms across Olive Gardens.
          </Typography>
        </Box>
      </Box>

      {/* Filter Tabs */}
      <Tabs 
        value={filterTab} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 4, 
          '& .MuiTab-root': { fontWeight: 700, borderRadius: '8px', px: 3 },
          '& .MuiTabs-indicator': { height: '3px', borderRadius: '3px' }
        }}
      >
        <Tab label="All Units" />
        <Tab label="Active Leases" />
        <Tab label="Expired Leases" />
        <Tab label="Short Term & Vacant" />
      </Tabs>

      {/* Grid of Flat Cards */}
      <Grid container spacing={3}>
        {filteredFlats.map((flatId) => {
          const details = getTenantDetails(flatId);
          const status = getLeaseStatus(details.leaseEnd);
          const isAirbnb = flatId === "Flat 8";

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={flatId}>
              <Card 
                sx={{ 
                  height: "100%", 
                  display: "flex", 
                  flexDirection: "column",
                  position: "relative",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 20px rgba(0,0,0,0.06)"
                  }
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  {/* Top Branding / Badge */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" fontWeight={850} color="primary.dark">
                      {flatId}
                    </Typography>
                    <Chip 
                      label={isAirbnb ? "Airbnb" : status.label} 
                      color={isAirbnb ? "secondary" : status.color} 
                      size="small" 
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>

                  {/* Occupant Profile */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 2 }}>
                    <Avatar sx={{ bgcolor: isAirbnb ? "secondary.main" : "primary.light", color: "white" }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={750} color="text.primary" noWrap>
                        {details.resident}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {isAirbnb ? "Short-Term Lodging" : "Resident"}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Contact & Lease Details */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1, mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EmailIcon fontSize="small" sx={{ color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: '0.85rem' }}>
                        {details.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PhoneIcon fontSize="small" sx={{ color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {details.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarTodayIcon fontSize="small" sx={{ color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {details.leaseStart ? `${details.leaseStart} to ${details.leaseEnd}` : "No Active Lease"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                      <AttachMoneyIcon fontSize="small" sx={{ color: "primary.main" }} />
                      <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                        ${details.rent?.toLocaleString()}/month
                      </Typography>
                    </Box>
                  </Box>

                  {/* Edit Action Button */}
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<EditIcon />}
                    fullWidth
                    onClick={() => handleOpenEdit(flatId)}
                    sx={{ mt: "auto", borderRadius: '8px', fontWeight: 700 }}
                  >
                    Edit Tenant
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit Tenant Dialog Modal */}
      <Dialog 
        open={editingUnit !== null} 
        onClose={handleCloseEdit} 
        fullWidth 
        maxWidth="xs"
        PaperProps={{
          sx: { borderRadius: '16px', p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'primary.dark' }}>
          Edit Details - {editingUnit}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1.5 }}>
            <TextField
              fullWidth
              label="Resident Name"
              name="resident"
              value={editForm.resident}
              onChange={handleFormChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={editForm.email}
              onChange={handleFormChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={editForm.phone}
              onChange={handleFormChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Monthly Rent"
              name="rent"
              type="number"
              value={editForm.rent}
              onChange={handleFormChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Lease Start Date"
              name="leaseStart"
              type="date"
              value={editForm.leaseStart}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Lease End Date"
              name="leaseEnd"
              type="date"
              value={editForm.leaseEnd}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleCloseEdit} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: '8px', fontWeight: 700 }}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TenantsPage;
