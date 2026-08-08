import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./admin/AdminDashboard";
import DoctorDashboard from "./doctor/DoctorDashboard";
import ReceptionistDashboard from "./receptionist/ReceptionistDashboard";
import NurseDashboard from "./nurse/NurseDashboard";
import PatientDashboard from "./patient/PatientDashboard";

const DASHBOARDS_BY_ROLE = {
  admin: AdminDashboard,
  doctor: DoctorDashboard,
  receptionist: ReceptionistDashboard,
  nurse: NurseDashboard,
  patient: PatientDashboard,
};

export default function DashboardRouter() {
  const { user } = useAuth();
  const RoleDashboard = DASHBOARDS_BY_ROLE[user.role];
  return <RoleDashboard />;
}
