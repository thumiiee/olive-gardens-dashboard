import { useState } from "react";
import { AppBar, IconButton, Toolbar, Typography, Avatar, Box, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonIcon from "@mui/icons-material/Person";
import { useData } from "./DataContext";

function Navbar({ drawerWidth, handleDrawerToggle }) {
  const { user, logout } = useData();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: '#1E3322', // Premium Dark Forest/Moss Green
        color: '#FFFFFF', // High-contrast crisp white text
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        borderBottom: 'none',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Larger brand logo & icon in navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
          <HomeWorkIcon sx={{ color: '#FFFFFF', fontSize: 32 }} />
          <Typography 
            variant="h5" 
            noWrap 
            component="div" 
            sx={{ 
              fontWeight: 800, 
              color: '#FFFFFF', 
              letterSpacing: 0.5,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Olive Gardens
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="inherit">
            <NotificationsIcon sx={{ color: '#FFFFFF' }} />
          </IconButton>
          
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.light', 
                color: 'primary.dark', 
                fontWeight: 'bold', 
                width: 38, 
                height: 38,
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {user?.avatar || "OG"}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 4,
              sx: {
                borderRadius: '16px',
                mt: 1.5,
                minWidth: 200,
                overflow: 'visible',
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1,
                  borderRadius: '10px',
                  mx: 1,
                  my: 0.5,
                  display: 'flex',
                  gap: 1.5,
                  fontSize: '0.9rem',
                  fontWeight: 550
                }
              }
            }}
          >
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', mb: 0.5 }}>
              <Typography variant="subtitle2" fontWeight={750} color="text.primary">
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role}
              </Typography>
            </Box>
            <MenuItem onClick={handleMenuClose}>
              <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              My Profile
            </MenuItem>
            <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main', '&:hover': { bgcolor: 'error.light' } }}>
              <ExitToAppIcon fontSize="small" sx={{ color: 'error.main' }} />
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
