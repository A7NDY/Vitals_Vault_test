import { useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import DoctorRequestManager from "@/lib/doctor-requests";
import { toast } from "@/hooks/use-toast";

type Msg = {
  id: string;
  sender: "doctor" | "patient";
  text: string;
  time: string; // ISO
};

const SAMPLE: Msg[] = [
  { id: "m1", sender: "doctor", text: "Hi Rachel, how are you feeling today?", time: new Date().toISOString() },
  { id: "m2", sender: "patient", text: "Hi Dr. Olivia — I'm feeling better, thanks.", time: new Date().toISOString() },
  { id: "m3", sender: "doctor", text: "Great, continue your medication and monitor blood pressure.", time: new Date().toISOString() },
];

function loadMessages() {
  try {
    const raw = localStorage.getItem("vv_messages");
    return raw ? (JSON.parse(raw) as Msg[]) : SAMPLE;
  } catch (e) {
    return SAMPLE;
  }
}

function persistMessages(msgs: Msg[]) {
  try {
    localStorage.setItem("vv_messages", JSON.stringify(msgs));
  } catch (e) {
    // ignore
  }
}

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>(() => loadMessages());
  const [text, setText] = useState("");
  const [connectedDoctors, setConnectedDoctors] = useState<any[]>([]);
  const [selectedDoctorEmail, setSelectedDoctorEmail] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => persistMessages(messages), [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load connected doctors
  useEffect(() => {
    if (user?.email) {
      const doctors = DoctorRequestManager.getAcceptedDoctorsForPatient(user.email);
      setConnectedDoctors(doctors);
      if (doctors.length > 0 && !selectedDoctorEmail) {
        setSelectedDoctorEmail(doctors[0].email);
      }
    }
  }, [user?.email, selectedDoctorEmail]);

  const selectedDoctor = useMemo(() => {
    const doc = connectedDoctors.find((d) => d.email === selectedDoctorEmail);
    return doc ? { name: doc.fullName, specialty: "General Practitioner", avatar: `https://i.pravatar.cc/40?img=${doc.email.charCodeAt(0) % 70}` } : null;
  }, [connectedDoctors, selectedDoctorEmail]);

  const patientName = useMemo(() => (user?.email ? user.email.split("@")[0] : "Patient"), [user]);

  function send() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const sender = user && user.role === "Patient" ? "patient" : "doctor";
    const m: Msg = { id: Date.now().toString(), sender, text: trimmed, time: new Date().toISOString() };
    setMessages((s) => [...s, m]);
    setText("");
    toast({ title: "Message sent" });
  }

  if (connectedDoctors.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-lg font-medium text-slate-900">No Connected Doctors</p>
            <p className="mt-2 text-slate-600">Connect with doctors in the Appointments page to start messaging.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Message Doctor</label>
            <select
              value={selectedDoctorEmail}
              onChange={(e) => setSelectedDoctorEmail(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              {connectedDoctors.map((doc) => (
                <option key={doc.email} value={doc.email}>
                  {doc.fullName}
                </option>
              ))}
            </select>
          </div>
          <h1 className="text-3xl font-semibold mb-4">{selectedDoctor?.name || "Doctor"}</h1>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6">
              <div className="max-h-[60vh] overflow-y-auto px-2">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`mb-4 flex ${m.sender === "patient" ? "justify-end" : "justify-start"}`}>
                      <div className={`${m.sender === "patient" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-800"} max-w-[70%] rounded-lg px-4 py-2 text-sm`}>
                        <div className="whitespace-pre-wrap">{m.text}</div>
                        <div className={`${m.sender === "patient" ? "text-sky-100" : "text-slate-500"} mt-1 text-xs`}>{new Date(m.time).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={endRef} />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-slate-300"
                />
                <button onClick={send} className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">Send</button>
              </div>
            </div>
          </div>
        </div>

        <aside>
          {selectedDoctor && (
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <img src={selectedDoctor.avatar} alt="doc" className="h-10 w-10 rounded-full" />
                <div>
                  <div className="text-sm font-medium">{selectedDoctor.name}</div>
                  <div className="text-xs text-slate-500">{selectedDoctor.specialty}</div>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-600">
                <div>
                  <div className="text-xs text-slate-500">Activity</div>
                  <div className="mt-1">Last message: {messages.length ? new Date(messages[messages.length - 1].time).toLocaleString() : "—"}</div>
                </div>

                <div>
                  <button className="w-full rounded-md border px-3 py-2 text-sm">Mark as Read</button>
                </div>
                <div>
                  <button className="w-full rounded-md border px-3 py-2 text-sm">Archive</button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </MainLayout>
  );
}
