// src/styles/theme.ts
import { createTheme } from '@mui/material';
import type { PaletteMode } from '@mui/material'; 

// Importa la nueva fuente (ej. 'Inter' de Google Fonts)
// Asegúrate de añadir <link> para preconnect y la fuente en tu index.html si la usas
// <link rel="preconnect" href="https://fonts.googleapis.com">
// <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet">


// Esta función creará nuestro tema basado en el modo (light o dark)
const getAppTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode, // Aquí es donde se define si el tema es 'light' o 'dark'
    primary: {
      main: '#1976d2', // Azul estándar de Material-UI
      light: '#42a5f5', // Un tono más claro de primary
      dark: '#0d47a1',  // Un tono más oscuro de primary
    },
    secondary: {
      main: '#9c27b0', // Morado estándar
      light: '#ce93d8',
      dark: '#7b1fa2',
    },
    error: {
      main: '#d32f2f',
    },
    info: {
      main: '#2196f3',
    },
    success: { // Añadir color de éxito para snacbkar
      main: '#4caf50',
    },
    warning: { // Añadir color de advertencia para snackbar
      main: '#ff9800',
    },
    // Definiciones específicas para modos claro y oscuro
    ...(mode === 'light'
      ? { // Paleta para el modo CLARO
          background: {
            default: '#f4f6f8', // Color de fondo principal claro
            paper: '#ffffff', // Color de fondo para componentes Paper (tarjetas, modales)
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
          },
          action: {
            hover: 'rgba(0, 0, 0, 0.04)', // Hover para filas de tabla, etc.
          },
        }
      : { // Paleta para el modo OSCURO
          background: {
            default: '#121212', // Color de fondo principal oscuro (casi negro)
            paper: '#1e1e1e', // Color de fondo para componentes Paper en oscuro
          },
          text: {
            primary: '#ffffff', // Texto principal blanco
            secondary: 'rgba(255, 255, 255, 0.7)', // Texto secundario ligeramente más oscuro
          },
          action: {
            hover: 'rgba(255, 255, 255, 0.08)', // Hover para filas de tabla, etc.
          },
        }),
  },
  typography: {
    // --- NUEVA TIPOGRAFÍA: Usaremos 'Inter' como ejemplo ---
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { // Ejemplo de ajuste para h4
      fontWeight: 700,
      fontSize: '2.125rem', // 34px
      '@media (min-width:600px)': {
        fontSize: '2.5rem', // 40px en pantallas más grandes
      },
    },
    h5: { // Ejemplo de ajuste para h5 (títulos de login/register)
        fontWeight: 700,
        fontSize: '1.5rem', // 24px
        '@media (min-width:600px)': {
          fontSize: '1.75rem', // 28px
        },
    },
    body1: { // Para texto principal
      fontSize: '1rem', // 16px
      lineHeight: 1.5,
    },
    body2: { // Para texto secundario/pequeño
      fontSize: '0.875rem', // 14px
      lineHeight: 1.43,
    },
    button: { // Para botones
      textTransform: 'none', // Desactivar mayúsculas por defecto en todos los botones
    },
  },
  components: {
    // --- Asegúrate de que los componentes de MUI se adapten al tema ---
    MuiAppBar: {
        styleOverrides: {
            colorPrimary: ({ theme }) => ({ // AppBar se adapta al color primario del tema actual
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.text.primary,
            }),
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                backgroundImage: 'none', // Evita cualquier gradiente por defecto en Paper
            },
        },
    },
    MuiDialogTitle: { // Asegura que el DialogTitle cambie de color
      styleOverrides: {
        root: ({ theme }) => ({ // Accede al tema para usar los colores
          backgroundColor: theme.palette.primary.main, // O usa background.paper para un modal más neutral
          color: theme.palette.text.primary,
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          backgroundColor: theme.palette.primary.dark, // Encabezado de tabla oscuro
          color: theme.palette.common.white,
        }),
        body: ({ theme }) => ({
          // Estilos para el cuerpo de la tabla, se adaptará al background.paper
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Quita la transformación a mayúsculas por defecto en los botones
        },
      },
    },
  },
});

export default getAppTheme; // Ahora exportamos la FUNCIÓN, no el objeto directamente