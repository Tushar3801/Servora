import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Services from "../pages/Services";
import ServiceWorkers from "../pages/ServiceWorkers";
import WorkerDetails from "../pages/WorkerDetails";
import CustomerProfile from "../pages/CustomerProfile";
import Booking from "../pages/Booking";
import MyBookings from "../pages/MyBookings";
import MyReviews from "../pages/MyReviews";
import WorkerDashboard from "../pages/WorkerDashboard";
import WorkerProfile from "../pages/WorkerProfile";
import WorkerServices from "../pages/WorkerServices";
import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/:serviceId/workers" element={<ServiceWorkers />} />
      <Route path="/workers/:workerId" element={<WorkerDetails />} />

      <Route
        path="/book/:workerId"
        element={
          <ProtectedRoute allowedRole="customer">
            <Booking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute allowedRole="customer">
            <MyBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-reviews"
        element={
          <ProtectedRoute allowedRole="customer">
            <MyReviews />
          </ProtectedRoute>
        }
      />

      <Route
        path="/worker-dashboard"
        element={
          <ProtectedRoute allowedRole="worker">
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/worker-profile"
        element={
          <ProtectedRoute allowedRole="worker">
            <WorkerProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/worker-services"
        element={
          <ProtectedRoute allowedRole="worker">
            <WorkerServices />
          </ProtectedRoute>
        }
      />

      <Route
  path="/customer-profile"
  element={
    <ProtectedRoute allowedRole="customer">
      <CustomerProfile />
    </ProtectedRoute>
  }
/>
    </Routes>
  );
}

export default AppRoutes;