import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const DashboardRedirect = () => {
  // Get user role from localStorage or your auth context
  const userRole = localStorage.getItem('userRole');
  
  // Redirect based on user role
  useEffect(() => {
    // You can add any additional logic here if needed
    console.log(`Redirecting user with role: ${userRole}`);
  }, [userRole]);

  // Default redirect paths based on user role
  const getRedirectPath = () => {
    switch(userRole) {
      case 'student':
        return '/student/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      default:
        return '/login'; // Redirect to login if no role is set
    }
  };

  return <Navigate to={getRedirectPath()} replace />;
};

export default DashboardRedirect;
