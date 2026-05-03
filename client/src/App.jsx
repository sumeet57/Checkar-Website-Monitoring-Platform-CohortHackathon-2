import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Monitoring from "./pages/Monitoring";
import Analytics from "./pages/Analytics";
import Feedback from "./pages/Feedback";
import Settings from "./pages/Settings";

import DashboardLayout from "./components/DashboardLayout";
import {Toaster} from "react-hot-toast";

const App = () => {
  return (
      <>
        <Toaster />
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected App Routes */}
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="monitoring" element={<Monitoring />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="settings" element={<Settings />} />
      </Route>

    </Routes>
      </>
  );
};

export default App;