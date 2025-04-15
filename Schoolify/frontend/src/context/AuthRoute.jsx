import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export const AuthRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export const NotAuthRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return !isAuthenticated ? <Outlet /> : <Navigate to="/principal" />;
};