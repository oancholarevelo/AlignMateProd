import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/next"
import Login from './components/Login';
import Register from './components/Register';
import PostureGraph from './components/PostureGraph';
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  console.log("App component rendered");

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
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;