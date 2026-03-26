import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import DoctorDashboard from "./pages/DoctorDashboard";
import Doctors from "./pages/Doctors";
import DoctorDetails from "./pages/DoctorDetails";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login/*" element={<Login />} />
      <Route
        path="/doctors"
        element={
          <ProtectedRoute allowedRole="patient">
            <Doctors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRole="patient">
            <Doctors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/:id"
        element={
          <ProtectedRoute allowedRole="patient">
            <DoctorDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
