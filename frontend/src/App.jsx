import { Routes, Route } from "react-router-dom";
import PortalSelect from "./pages/PortalSelect";
import InternalLogin from "./pages/internal/InternalLogin";
import ExternalLogin from "./pages/external/ExternalLogin";
import ExternalRegister from "./pages/external/ExternalRegister";
import DashboardRouter from "./pages/DashboardRouter";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PortalSelect />} />
      <Route path="/login/internal" element={<InternalLogin />} />
      <Route path="/login/external" element={<ExternalLogin />} />
      <Route path="/register/external" element={<ExternalRegister />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<PortalSelect />} />
    </Routes>
  );
}

export default App;
