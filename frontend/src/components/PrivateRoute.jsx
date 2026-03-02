import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  // 🔍 Décodage du payload (base64) du JWT
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role;

    if (!requiredRole || userRole === requiredRole) {
      return children;
    } else {
      return <Navigate to="/" />; // 🚫 Redirection si rôle incorrect
    }
  } catch (err) {
    return <Navigate to="/login" />; // ⚠️ Token mal formé
  }
}

export default PrivateRoute;
