import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  CircularProgress,
  Paper,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";
import type { AlertColor } from "@mui/material/Alert";

// CAMBIO CLAVE: Importamos la URL centralizada
import { API_BASE_URL } from '../apiConfig';

// Importaciones de iconos para los campos de texto
import AccountCircle from "@mui/icons-material/AccountCircle";
import Lock from "@mui/icons-material/Lock";

// Importación para animaciones de Framer Motion
import { motion } from "framer-motion";

// Se elimina la URL hardcodeada de aquí

const Login: React.FC = () => {
  const navigate = useNavigate(); // Hook para la navegación

  // Estados para los campos del formulario
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  // Estados para el manejo de la UI y errores
  const [loading, setLoading] = useState<boolean>(false); // Para el spinner del botón
  const [error, setError] = useState<string | null>(null); // Para errores generales del formulario

  // Estados para el Snackbar (notificaciones temporales)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<AlertColor>("success"); // Tipo de alerta (success, error, warning, info)

  // Función para mostrar el Snackbar
  const handleOpenSnackbar = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Función para cerrar el Snackbar
  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Función para manejar el envío del formulario de login
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Evita el comportamiento por defecto de recargar la página

    setError(null); // Limpia cualquier mensaje de error anterior
    setLoading(true); // Activa el estado de carga para mostrar el spinner

    try {
      // CAMBIO CLAVE: Se usa la URL de la API para el login, apuntando a la ruta correcta
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email,
        password,
      });

      // Mensaje de éxito en consola (limpio)
      console.log("Login successful! Token received.");
      // Muestra una notificación de éxito al usuario
      handleOpenSnackbar("Login successful!", "success");

      // Guarda el token de autenticación (JWT) en localStorage para futuras peticiones autenticadas
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }
      // Guarda los datos del usuario (id, username, email) en localStorage como JSON string
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      // Redirige al usuario al dashboard después de un login exitoso
      navigate("/dashboard");
    } catch (err: any) {
      // Desactiva el estado de carga del botón
      setLoading(false);
      // Registra el error completo en la consola para depuración
      console.error("Error de login:", err);

      // Variable para almacenar el mensaje de error a mostrar al usuario
      let errorMessage = "An unknown error occurred during login.";

      // Intenta extraer un mensaje de error específico de la respuesta del backend
      if (err.response && err.response.data) {
        if (err.response.data.message) {
          // Mensaje de error enviado por el backend (ej. "Invalid credentials.")
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          // Otra forma en que el backend puede enviar errores (ej. "An error occurred...")
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        // Mensaje de error general de red o de Axios (ej. "Network Error")
        errorMessage = err.message;
      }

      // Establece el mensaje de error para mostrar en el formulario (si lo necesitas)
      setError(errorMessage);
      // Muestra el mensaje de error en el Snackbar al usuario
      handleOpenSnackbar(errorMessage, "error");
    } finally {
      // Asegura que el spinner de carga se oculte siempre, sin importar el resultado
      setLoading(false);
    }
  };

  // --- Variantes de animación para Framer Motion ---
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ width: "100%" }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{ mb: 3, color: "primary.main", fontWeight: "bold" }}
          >
            Welcome Back!
          </Typography>

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box
            component="form"
            noValidate
            sx={{ mt: 1, width: "100%" }}
            onSubmit={handleSubmit}
          >
            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                label="Email Address"
                margin="normal"
                type="email"
                required
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle color="action" />
                    </InputAdornment>
                  ),
                }}
                error={
                  snackbarOpen &&
                  snackbarSeverity === "warning" &&
                  email.trim() === ""
                }
                helperText={
                  snackbarOpen &&
                  snackbarSeverity === "warning" &&
                  email.trim() === ""
                    ? "Email is required."
                    : ""
                }
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                label="Password"
                margin="normal"
                type="password"
                required
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                }}
                error={
                  snackbarOpen &&
                  snackbarSeverity === "warning" &&
                  password.trim() === ""
                }
                helperText={
                  snackbarOpen &&
                  snackbarSeverity === "warning" &&
                  password.trim() === ""
                    ? "Password is required."
                    : ""
                }
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Login"
                )}
              </Button>
            </motion.div>
          </Box>

          <motion.div variants={itemVariants}>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Button
                  variant="text"
                  onClick={() => navigate("/register")}
                  sx={{
                    padding: 0,
                    minWidth: 0,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                  >
                    Register here
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

export default Login;
