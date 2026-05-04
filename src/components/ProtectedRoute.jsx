import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, isAdmin = false }) => {
  const { userInfo } = useSelector((state) => state.user);

  if (!userInfo) {
    return <Navigate to="/login" />;
  }

  if (isAdmin && userInfo.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
