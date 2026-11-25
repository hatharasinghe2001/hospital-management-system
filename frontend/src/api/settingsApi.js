import axiosClient from "./axiosClient";

export async function fetchHospitalCharge() {
  const { data } = await axiosClient.get("/settings/hospital-charge");
  return data.hospitalCharge;
}

export async function updateHospitalCharge(hospitalCharge) {
  const { data } = await axiosClient.put("/settings/hospital-charge", { hospitalCharge });
  return data.hospitalCharge;
}
