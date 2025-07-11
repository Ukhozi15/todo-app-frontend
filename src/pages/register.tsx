import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Paper,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Snackbar, Alert } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';

// CAMBIO CLAVE: Importamos la URL centralizada
import { API_BASE_URL } from '../apiConfig';

// Importaciones de iconos para los campos de texto
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockIcon from '@mui/icons-material/Lock';

// Importación para animaciones de Framer Motion
import { motion } from 'framer-motion';

const Register: React.FC = () => {
  const navigate = useNavigate();

  // Estados del formulario
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Estados para el Snackbar (notificaciones temporales)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  // Función para mostrar el Snackbar
  const handleOpenSnackbar = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Función para cerrar el Snackbar
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Función para manejar el envío del formulario de registro
  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      handleOpenSnackbar("All fields are required!", "warning");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        handleOpenSnackbar("Please enter a valid email address.", "warning");
        return;
    }
    if (password.length < 6) {
        handleOpenSnackbar("Password must be at least 6 characters long.", "warning");
        return;
    }

    setLoading(true);

    try {
      // CAMBIO CLAVE: Se usa la URL de la API para el registro, apuntando a la ruta correcta
      const response = await axios.post(`${API_BASE_URL}/api/users/register`, {
        username,
        email,
        password
      });

      console.log("Registration successful:", response.data);
      handleOpenSnackbar("Registration successful! You can now log in.", "success");
      navigate("/");

    } catch (error: any) {
      console.error("Registration error:", error);
      let message = "Registration failed. Please try again.";
      let severity: AlertColor = "error";

      if (error.response && error.response.data) {
        if (error.response.data.error) {
          message = error.response.data.error;
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      }
      handleOpenSnackbar(message, severity);

    } finally {
      setLoading(false);
    }
  };

  // --- Variantes de animación para Framer Motion ---
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ width: '100%' }}
      >
        <Paper elevation={6} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold' }}>
            Create Account
          </Typography>

          <Box component="form" noValidate sx={{ mt: 1, width: '100%' }} onSubmit={handleRegister}>
            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                label="Username"
                type="text"
                margin="normal"
                required
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                error={snackbarOpen && snackbarSeverity === "warning" && username.trim() === ""}
                helperText={snackbarOpen && snackbarSeverity === "warning" && username.trim() === "" ? "Username is required." : ""}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                margin="normal"
                required
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                error={snackbarOpen && snackbarSeverity === "warning" && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))}
                helperText={snackbarOpen && snackbarSeverity === "warning" && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ? "Please enter a valid email." : ""}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                required
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                error={snackbarOpen && snackbarSeverity === "warning" && password.length < 6}
                helperText={snackbarOpen && snackbarSeverity === "warning" && password.length < 6 ? "Password must be at least 6 characters long." : ""}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
              </Button>
            </motion.div>
          </Box>

          <motion.div variants={itemVariants}>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Button
                  variant="text"
                  onClick={() => navigate("/")}
                  sx={{ padding: 0, minWidth: 0, '&:hover': { textDecoration: 'underline' } }}
                >
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                    Login here
                  </Typography>
                </Button>
              </Typography>
            </Box>
          </motion.div>
        </Paper>
      </motion.div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;
