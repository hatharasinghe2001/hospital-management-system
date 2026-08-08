// Per-role metadata, used once a user is signed in (dashboards, profile, etc.)
export const PORTALS = [
  {
    role: "admin",
    label: "Admin",
    description: "Manage staff, departments and system-wide settings",
    icon: "⚙️",
  },
  {
    role: "doctor",
    label: "Doctor",
    description: "View appointments, patients and medical records",
    icon: "🩺",
  },
  {
    role: "receptionist",
    label: "Receptionist",
    description: "Book appointments and manage patient front-desk tasks",
    icon: "📋",
  },
  {
    role: "nurse",
    label: "Nurse",
    description: "Assist with patient care, wards and vitals tracking",
    icon: "💉",
  },
  {
    role: "patient",
    label: "Patient",
    description: "View your appointments, prescriptions and bills",
    icon: "🩻",
  },
];

export function getPortal(role) {
  return PORTALS.find((p) => p.role === role);
}

// The two sign-in gateways: staff (internal) vs patients (external)
export const PORTAL_GROUPS = [
  {
    key: "internal",
    label: "Internal Users",
    description: "Staff sign-in for admins, doctors, receptionists and nurses",
    icon: "🏥",
  },
  {
    key: "external",
    label: "External Users",
    description: "Patient sign-in and self-registration",
    icon: "🧑‍🤝‍🧑",
  },
];

export function getPortalGroup(key) {
  return PORTAL_GROUPS.find((g) => g.key === key);
}
