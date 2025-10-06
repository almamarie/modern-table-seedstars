import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import VirtualizedModernTable from "./pages/VirtualizedModernTable";
import ModernTable from "./pages/ModernTable";
import Navigation from "./components/Navigation";
import RefactorTable from "./pages/RefactorTable";

function App() {
  return (
    <Router>
      <div className="bg-gray-50">
        <div>
          <Navigation />
        </div>
        <div className="mx-auto px-4 container">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/virtualized-modern-table" replace />}
            />
            <Route
              path="/virtualized-modern-table"
              element={<VirtualizedModernTable />}
            />
            <Route path="/modern-table" element={<ModernTable />} />
            <Route path="/refactor-table" element={<RefactorTable />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const queryClient = new QueryClient();

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
