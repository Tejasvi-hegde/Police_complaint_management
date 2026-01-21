import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { token, role: userRole } = useContext(AuthContext);

    if (!token) {
        return <Navigate to="/" />;
    }

    if (role && userRole !== role) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
