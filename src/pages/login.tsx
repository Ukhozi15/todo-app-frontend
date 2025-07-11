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

// Importaciones de iconos para los campos de texto
import AccountCircle from "@mui/icons-material/AccountCircle";
import Lock from "@mui/icons-material/Lock";

// Importación para animaciones de Framer Motion
import { motion } from "framer-motion";

const API_BASE_URL = "http://localhost:5000/api/users"; // URL base de tu API de usuarios

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
      // Realiza la petición POST al endpoint de login de tu backend
      const response = await axios.post(`${API_BASE_URL}/login`, {
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
  // Animación para el contenedor principal (la tarjeta Paper)
  const containerVariants = {
    hidden: { opacity: 0, y: 50 }, // Inicia invisible y un poco abajo
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    }, // Transición suave a la posición final
  };

  // Animación para cada elemento dentro del formulario (campos, botón, enlace)
  const itemVariants = {
    hidden: { opacity: 0, y: 20 }, // Inicia invisible y un poco abajo
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    }, // Transición suave a la posición final
  };

  return (
    // Contenedor principal de la página, centra el formulario
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
      {/* motion.div para animar la entrada de la tarjeta Paper */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ width: "100%" }} // Asegura que ocupe el ancho completo dentro del Container
      >
        {/* Componente Paper para la tarjeta del formulario con estilos de Material-UI */}
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

          {/* Mensaje de error general del formulario (debajo del título) */}
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* Formulario de Login */}
          <Box
            component="form"
            noValidate
            sx={{ mt: 1, width: "100%" }}
            onSubmit={handleSubmit}
          >
            {/* Campo Email con animación */}
            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                label="Email Address"
                margin="normal"
                type="email"
                required
                variant="outlined" // Estilo con borde
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }} // Margen inferior
                InputProps={{
                  // Icono en el campo
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle color="action" />
                    </InputAdornment>
                  ),
                }}
                // Lógica para mostrar error si el campo está vacío y hay una advertencia del Snackbar
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
            {/* Campo Password con animación */}
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
            {/* Botón de Login con animación */}
            <motion.div variants={itemVariants}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2, py: 1.5, borderRadius: 2 }} // Padding y bordes redondeados
                type="submit"
                disabled={loading} // Deshabilita el botón durante la carga
                whileTap={{ scale: 0.95 }} // Animación de escala al presionar
              >
                {/* Muestra spinner o texto del botón */}
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Login"
                )}
              </Button>
            </motion.div>
          </Box>

          {/* Sección de "Don't have an account?" con animación */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Button
                  variant="text"
                  onClick={() => navigate("/register")} // Redirige a la página de registro
                  sx={{
                    padding: 0,
                    minWidth: 0,
                    "&:hover": { textDecoration: "underline" },
                  }} // Estilos de botón de texto
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

      {/* Snackbar para mostrar mensajes de notificación */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // Posición del Snackbar
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
