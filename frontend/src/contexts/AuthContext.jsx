import { createContext, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout as logoutAction } from '../store/slices/authSlice';

// Create the auth context
export const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector(state => state.auth);
  const navigate = useNavigate();

  // Initialize auth state from Redux
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData && !user) {
          // If we have a token but no user in Redux, try to log in
          const user = JSON.parse(userData);
          // This will update the Redux store
          await dispatch(login.fulfilled(user, '', { 
            email: user.email, 
            password: '123456' // Default password for auto-login
          }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initializeAuth();
  }, [dispatch, user]);

  // Login function that syncs with Redux
  const loginUser = useCallback(async (credentials) => {
    try {
      const result = await dispatch(login(credentials));
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [dispatch]);

  // Logout function that syncs with Redux
  const logoutUser = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    dispatch(logoutAction());
    navigate('/login');
  }, [dispatch, navigate]);

  // Check if user has a specific role
  const hasRole = useCallback((role) => {
    if (!user) return false;
    return user.role === role || user.role === 'admin';
  }, [user]);

  // Check if user has any of the required roles
  const hasAnyRole = useCallback((requiredRoles) => {
    if (!user) return false;
    return requiredRoles.includes(user.role) || user.role === 'admin';
  }, [user]);

  // Expose the auth state and methods
  const value = {
    user,
    isAuthenticated,
    loading,
    login: loginUser,
    logout: logoutUser,
    hasRole,
    hasAnyRole,
    updateUser: (userData) => {
      // This is a no-op since we're using Redux for state management
      // The actual update should be done through Redux actions
      console.warn('updateUser is not implemented. Use Redux actions instead.');
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
