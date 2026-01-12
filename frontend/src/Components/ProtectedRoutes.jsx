import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    // If there is no token, send them to the login page
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If there IS a token, show the page they asked for
    return children;
};

export default ProtectedRoute;