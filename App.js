import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Login from "./components/Login";
import Register from "./components/Register";
import PostureGraph from "./components/PostureGraph";
import ContactPage from "./components/ContactPage";
import ResearchPage from "./components/ResearchPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <PostureGraph />
              </ProtectedRoute>
            }
          />
          {/* Add the contact page route - accessible without authentication */}
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact-us" element={<Navigate to="/contact" />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/research-form" element={<Navigate to="/research" />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
      <SpeedInsights />
    </AuthProvider>
  );
}

export default App;
