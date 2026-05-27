import { useState } from "react";
import { 
  Box, Card, CardContent, Typography, TextField, 
  Button, Alert, InputAdornment, IconButton
} from "@mui/material";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useData } from "./DataContext";

function LoginPage() {
  const { login, registerUser } = useData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    
    const result = await login(email, password);
    if (!result.success) {
      setErrorMsg(result.error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!email || !password || !name || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    
    if (!email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    
    const result = await registerUser(email, password, name);
    if (!result.success) {
      setErrorMsg(result.error);
    } else {
      setSuccessMsg("Account created! You can now sign in with your credentials.");
      setEmail("");
      setPassword("");
      setName("");
      setConfirmPassword("");
      setTimeout(() => setIsRegistering(false), 2000);
    }
  };

  return (
    <Box 
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "linear-gradient(135deg, #EFF2EC 0%, #D4DDD0 100%)",
        p: 2
      }}
    >
      <Card 
        sx={{
          maxWidth: 450,
          width: "100%",
          borderRadius: "24px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          backgroundColor: "rgba(252, 253, 251, 0.85)",
          backdropFilter: "blur(20px)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo Branding */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
            <Box 
              sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: "20px", 
                backgroundColor: "primary.main", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                boxShadow: "0 8px 16px rgba(88, 129, 87, 0.3)",
                mb: 2
              }}
            >
              <HomeWorkIcon sx={{ color: "white", fontSize: 36 }} />
            </Box>
            <Typography variant="h4" fontWeight={900} color="primary.dark" align="center">
              Olive Gardens
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" mt={0.5}>
              Management Portal & Financial Dashboard
            </Typography>
          </Box>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
              {errorMsg}
            </Alert>
          )}

          {successMsg && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: "12px" }}>
              {successMsg}
            </Alert>
          )}

          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  boxShadow: "0 6px 20px rgba(88, 129, 87, 0.2)",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(88, 129, 87, 0.3)",
                  }
                }}
              >
                Sign In
              </Button>
            </Box>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  }
                }}
              />

              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  }
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                variant="outlined"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  boxShadow: "0 6px 20px rgba(88, 129, 87, 0.2)",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(88, 129, 87, 0.3)",
                  }
                }}
              >
                Create Account
              </Button>
            </Box>
            </form>
          )}

          {/* Toggle Button */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Button
              color="primary"
              sx={{ fontWeight: 600 }}
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrorMsg("");
                setSuccessMsg("");
              }}
            >
              {isRegistering ? "Already have an account? Sign In" : "Need an account? Create one"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;
