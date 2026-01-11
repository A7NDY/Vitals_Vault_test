/**
 * Doctor Request System
 * Manages patient requests to connect with doctors
 */

export interface DoctorRequest {
  id: string;
  patientEmail: string;
  doctorEmail: string;
  doctorName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  respondedAt?: string;
}

export interface DoctorProfile {
  email: string;
  fullName: string;
  specialization?: string;
}

class DoctorRequestManager {
  private readonly REQUESTS_KEY = "vv_doctor_requests";
  private readonly DOCTORS_KEY = "vv_doctors_list";

  /**
   * Get all available doctors from registered users
   */
  static getAvailableDoctors(): DoctorProfile[] {
    try {
      const raw = localStorage.getItem("vv_registered_users");
      const users = raw ? JSON.parse(raw) : [];
      return users
        .filter((u: any) => u.role === "Doctor")
        .map((u: any) => ({
          email: u.email,
          fullName: u.fullName,
          specialization: "General Practitioner",
        }));
    } catch (e) {
      return [];
    }
  }

  /**
   * Create a new doctor request
   */
  static createRequest(
    patientEmail: string,
    doctorEmail: string,
    doctorName: string,
  ): DoctorRequest {
    const request: DoctorRequest = {
      id: Date.now().toString(),
      patientEmail,
      doctorEmail,
      doctorName,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const requests = this.getAllRequests();
    requests.push(request);
    this.persistRequests(requests);

    return request;
  }

  /**
   * Get all doctor requests
   */
  static getAllRequests(): DoctorRequest[] {
    try {
      const raw = localStorage.getItem(this.REQUESTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Get pending requests for a doctor
   */
  static getPendingRequestsForDoctor(doctorEmail: string): DoctorRequest[] {
    return this.getAllRequests().filter(
      (r) => r.doctorEmail === doctorEmail && r.status === "pending",
    );
  }

  /**
   * Get requests from a patient
   */
  static getRequestsFromPatient(patientEmail: string): DoctorRequest[] {
    return this.getAllRequests().filter((r) => r.patientEmail === patientEmail);
  }

  /**
   * Check if patient has accepted request from doctor
   */
  static hasAcceptedDoctor(patientEmail: string, doctorEmail: string): boolean {
    return this.getAllRequests().some(
      (r) =>
        r.patientEmail === patientEmail &&
        r.doctorEmail === doctorEmail &&
        r.status === "accepted",
    );
  }

  /**
   * Get accepted doctors for a patient
   */
  static getAcceptedDoctorsForPatient(patientEmail: string): DoctorProfile[] {
    const requests = this.getRequestsFromPatient(patientEmail).filter(
      (r) => r.status === "accepted",
    );
    return requests.map((r) => ({
      email: r.doctorEmail,
      fullName: r.doctorName,
      specialization: "General Practitioner",
    }));
  }

  /**
   * Check if patient has pending request with doctor
   */
  static hasPendingRequestWithDoctor(
    patientEmail: string,
    doctorEmail: string,
  ): boolean {
    return this.getAllRequests().some(
      (r) =>
        r.patientEmail === patientEmail &&
        r.doctorEmail === doctorEmail &&
        r.status === "pending",
    );
  }

  /**
   * Accept a doctor request
   */
  static acceptRequest(requestId: string): DoctorRequest | null {
    const requests = this.getAllRequests();
    const request = requests.find((r) => r.id === requestId);

    if (!request) return null;

    request.status = "accepted";
    request.respondedAt = new Date().toISOString();

    this.persistRequests(requests);
    return request;
  }

  /**
   * Reject a doctor request
   */
  static rejectRequest(requestId: string): DoctorRequest | null {
    const requests = this.getAllRequests();
    const request = requests.find((r) => r.id === requestId);

    if (!request) return null;

    request.status = "rejected";
    request.respondedAt = new Date().toISOString();

    this.persistRequests(requests);
    return request;
  }

  /**
   * Persist requests to localStorage
   */
  private static persistRequests(requests: DoctorRequest[]): void {
    try {
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
    } catch (e) {
      console.error("Error persisting doctor requests:", e);
    }
  }
}

export default DoctorRequestManager;
