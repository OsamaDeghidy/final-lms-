import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#0288d1',
      light: '#7D9AFC',
      dark: '#0288d1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0e5181',
      light: '#968FFF',
      dark: '#4D44B5',
      contrastText: '#ffffff',
    },
    success: {
      main: '#00C853',
      light: '#5EFC82',
      dark: '#009624',
    },
    warning: {
      main: '#FFAB00',
      light: '#FFD54F',
      dark: '#FF8F00',
    },
    error: {
      main: '#FF3D00',
      light: '#FF6E40',
      dark: '#DD2C00',
    },
    background: {
      default: '#F8FAFF',
      paper: '#ffffff',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
      disabled: '#B3B3B3',
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: '"Tajawal", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.75,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.75,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    overline: {
      fontSize: '0.75rem',
      lineHeight: 2.66,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body': {
          scrollBehavior: 'smooth',
        },
        a: {
          textDecoration: 'none',
          color: 'inherit',
        },
        '.MuiContainer-root': {
          paddingLeft: '24px',
          paddingRight: '24px',
          '@media (min-width: 600px)': {
            paddingLeft: '32px',
            paddingRight: '32px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: 'none',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9375rem',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
          '&.MuiButton-contained': {
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            },
          },
          '&.MuiButton-outlined': {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
            },
          },
        },
        contained: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          '&.MuiButton-containedPrimary': {
            background: 'linear-gradient(90deg, #0288d1 0%, #0e5181 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#E0E0E0',
            },
            '&:hover fieldset': {
              borderColor: '#BDBDBD',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0288d1',
              boxShadow: '0 0 0 3px rgba(74, 108, 247, 0.1)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: 'rgba(74, 108, 247, 0.1)',
          color: '#0288d1',
        },
        colorSecondary: {
          backgroundColor: 'rgba(108, 99, 255, 0.1)',
          color: '#0e5181',
        },
      },
    },
  },
  customShadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.08)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.1)',
    large: '0 8px 24px rgba(0, 0, 0, 0.12)',
    primary: '0 8px 24px rgba(74, 108, 247, 0.2)',
    secondary: '0 8px 24px rgba(108, 99, 255, 0.2)',
  },
});

// Add global styles
const globalStyles = {
  '.text-ellipsis': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '.text-gradient': {
    background: 'linear-gradient(90deg, #0288d1 0%, #0e5181 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  '.glass-effect': {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  '.smooth-transition': {
    transition: 'all 0.3s ease',
  },
};

export { globalStyles };
export default theme;
