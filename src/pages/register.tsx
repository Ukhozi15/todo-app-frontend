import React, { useState } from "react"; // Asegúrate de importar useState
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

// Importaciones de iconos para los campos de texto
import PersonIcon from '@mui/icons-material/Person'; // Icono para Username
import MailOutlineIcon from '@mui/icons-material/MailOutline'; // Icono para Email
import LockIcon from '@mui/icons-material/Lock'; // Icono para Password

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

    // Validación básica del lado del cliente antes de enviar al backend
    if (!username.trim() || !email.trim() || !password.trim()) {
      handleOpenSnackbar("All fields are required!", "warning");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        handleOpenSnackbar("Please enter a valid email address.", "warning");
        return;
    }
    if (password.length < 6) { // Ejemplo de validación de contraseña
        handleOpenSnackbar("Password must be at least 6 characters long.", "warning");
        return;
    }

    setLoading(true); // Activa el estado de carga para mostrar el spinner

    try {
      // Realiza la petición POST al endpoint de registro de tu backend
      const response = await axios.post('http://localhost:5000/api/users/register', {
        username,
        email,
        password
      });

      console.log("Registration successful:", response.data);
      handleOpenSnackbar("Registration successful! You can now log in.", "success");
      navigate("/"); // Redirige al login después de un registro exitoso

    } catch (error: any) {
      console.error("Registration error:", error); // Log del error en consola
      let message = "Registration failed. Please try again.";
      let severity: AlertColor = "error";

      // Manejo de errores basado en la respuesta del backend
      if (error.response && error.response.data) {
        if (error.response.data.error) { // Si el backend envía 'error' (ej. ER_DUP_ENTRY)
          message = error.response.data.error;
        } else if (error.response.data.message) { // Si el backend envía 'message'
          message = error.response.data.message;
        }
      }
      handleOpenSnackbar(message, severity); // Muestra el error en el Snackbar

    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  // --- Variantes de animación para Framer Motion ---
  // Animación para el contenedor principal (la tarjeta Paper)
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  // Animación para cada elemento dentro del formulario (campos, botón, enlace)
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    // Contenedor principal de la página, centra el formulario
    <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* motion.div para animar la entrada de la tarjeta Paper */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ width: '100%' }} // Asegura que ocupe el ancho completo dentro del Container
      >
        {/* Componente Paper para la tarjeta del formulario con estilos de Material-UI */}
        <Paper elevation={6} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold' }}>
            Create Account
          </Typography>

          {/* Formulario de Registro */}
          <Box component="form" noValidate sx={{ mt: 1, width: '100%' }} onSubmit={handleRegister}>
            {/* Campo Username con animación */}
            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                label="Username"
                type="text"
                margin="normal"
                required
                variant="outlined" // Estilo con borde
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }} // Margen inferior
                InputProps={{ // Icono en el campo
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                // Lógica para mostrar error si el campo está vacío y hay una advertencia del Snackbar
                error={snackbarOpen && snackbarSeverity === "warning" && username.trim() === ""}
                helperText={snackbarOpen && snackbarSeverity === "warning" && username.trim() === "" ? "Username is required." : ""}
              />
            </motion.div>
            {/* Campo Email con animación */}
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
            {/* Campo Password con animación */}
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

            {/* Botón de Registro con animación */}
            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
                disabled={loading}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
              </Button>
            </motion.div>
          </Box>

          {/* Sección de "Already have an account?" con animación */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Button
                  variant="text"
                  onClick={() => navigate("/")} // Redirige a la página de login
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

      {/* Snackbar para mostrar mensajes de notificación */}
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