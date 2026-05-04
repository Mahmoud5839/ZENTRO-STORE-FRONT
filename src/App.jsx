import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMessages from "./pages/admin/Messages";
import AdminProducts from "./pages/admin/Products";
import AdminReturns from "./pages/admin/Returns";
import MyMessages from "./pages/MyMessages";
import Cart from "./pages/Cart";
import MyReturns from "./pages/MyReturns";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute isAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute isAdmin={true}>
              <AdminMessages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute isAdmin={true}>
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/returns"
          element={
            <ProtectedRoute isAdmin={true}>
              <AdminReturns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-messages"
          element={
            <ProtectedRoute>
              <MyMessages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-returns"
          element={
            <ProtectedRoute>
              <MyReturns />
            </ProtectedRoute>
          }
        />

        <Route path="/cart" element={<Cart />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
      </Routes>
    </Router>
  );
}

export default App;
