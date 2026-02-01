import { useState, useEffect, useRef, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import DoctorRequestManager from "@/lib/doctor-requests";
import { PatientDataStorage } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import {
  Send,
  Paperclip,
  X,
  AlertCircle,
  Calendar,
  FileText,
} from "lucide-react";

interface DoctorMessage {
  id: string;
  sender: "doctor" | "patient";
  text: string;
  time: string;
  attachment?: string;
}

interface Conversation {
  id: string;
  patientEmail: string;
  patientName: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: boolean;
  messages: DoctorMessage[];
}

interface SystemAlert {
  id: string;
  type: "alert" | "appointment" | "report";
  title: string;
  description: string;
  icon: React.ReactNode;
}

function loadDoctorConversations() {
  try {
    const raw = localStorage.getItem("vv_doctor_conversations");
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch (e) {
    return [];
  }
}

function persistDoctorConversations(conversations: Conversation[]) {
  try {
    localStorage.setItem(
      "vv_doctor_conversations",
      JSON.stringify(conversations),
    );
  } catch (e) {
    // ignore
  }
}

export default function DoctorMessages() {
  const { user } = useAuth();
  const [allConversations, setAllConversations] = useState<Conversation[]>(() =>
    loadDoctorConversations(),
  );
  const [connectedPatients, setConnectedPatients] = useState<Set<string>>(new Set());
  const [selectedConvId, setSelectedConvId] = useState<string>("");
  const [messageText, setMessageText] = useState("");
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    persistDoctorConversations(allConversations);
  }, [allConversations]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConvId, allConversations]);

  useEffect(() => {
    if (user?.email) {
      const patients = DoctorRequestManager.getAcceptedPatientsForDoctor(user.email);
      const patientEmails = new Set(patients.map((p) => p.email));
      setConnectedPatients(patientEmails);

      // Load messages from patients and build conversations
      try {
        const allMessages = JSON.parse(localStorage.getItem("vv_messages") || "[]");

        // Group messages by patient email
        const messagesByPatient: Record<string, any[]> = {};
        allMessages.forEach((msg: any) => {
          // Messages from patients going to doctors are marked with sender="patient"
          // We need to create conversations for these
          if (!messagesByPatient[msg.patientEmail || "unknown"]) {
            messagesByPatient[msg.patientEmail || "unknown"] = [];
          }
          messagesByPatient[msg.patientEmail || "unknown"].push(msg);
        });

        // Build conversations from messages
        const conversationsFromMessages: Conversation[] = Object.entries(messagesByPatient)
          .filter(([email]) => patientEmails.has(email))
          .map(([email, messages]: [string, any[]]) => {
            const patient = patients.find((p) => p.email === email);
            const patientData = PatientDataStorage.getPatientData(email);
            const lastMsg = messages[messages.length - 1];

            return {
              id: `conv-${email}`,
              patientEmail: email,
              patientName: patientData?.fullName || patient?.fullName || email,
              avatar: `https://i.pravatar.cc/40?img=${email.charCodeAt(0) % 70}`,
              lastMessage: lastMsg?.text || "",
              lastTime: lastMsg ? new Date(lastMsg.time).toLocaleTimeString() : "",
              unread: false,
              messages: messages.map((m: any) => ({
                id: m.id,
                sender: m.sender as "doctor" | "patient",
                text: m.text,
                time: m.time,
              })),
            };
          });

        // Merge with existing doctor conversations
        const existingConvs = loadDoctorConversations();
        const mergedConversations = [
          ...conversationsFromMessages,
          ...existingConvs.filter((ec) => !conversationsFromMessages.some((cm) => cm.patientEmail === ec.patientEmail)),
        ];

        setAllConversations(mergedConversations);
      } catch (e) {
        console.error("Error loading messages:", e);
      }
    }
  }, [user?.email]);

  if (!user || user.role !== "Doctor") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Access denied</p>
        </div>
      </MainLayout>
    );
  }

  const filteredConversations = useMemo(() => {
    return allConversations.filter((conv) =>
      connectedPatients.has(conv.patientEmail),
    );
  }, [allConversations, connectedPatients]);

  useEffect(() => {
    if (!selectedConvId && filteredConversations.length > 0) {
      setSelectedConvId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedConvId]);

  const selectedConversation = useMemo(() => {
    return filteredConversations.find((c) => c.id === selectedConvId);
  }, [filteredConversations, selectedConvId]);

  function handleSendMessage() {
    const trimmed = messageText.trim();
    if (!trimmed || !selectedConversation) return;

    const newMessage: DoctorMessage = {
      id: Date.now().toString(),
      sender: "doctor",
      text: trimmed,
      time: new Date().toISOString(),
    };

    // Update doctor conversations
    setAllConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === selectedConvId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: trimmed,
            lastTime: "now",
          };
        }
        return conv;
      }),
    );

    // Also save to vv_messages so patient sees it
    try {
      const allMessages = JSON.parse(localStorage.getItem("vv_messages") || "[]");
      allMessages.push({
        id: newMessage.id,
        sender: "doctor",
        text: trimmed,
        time: newMessage.time,
        patientEmail: selectedConversation.patientEmail,
      });
      localStorage.setItem("vv_messages", JSON.stringify(allMessages));
    } catch (e) {
      console.error("Error saving message:", e);
    }

    setMessageText("");
    toast({
      title: "Message sent",
      description: `Message sent to ${selectedConversation.patientName}`,
    });
  }

  function handleDismissAlert(alertId: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    toast({
      title: "Alert dismissed",
    });
  }

  const unreadCount = useMemo(() => {
    return filteredConversations.filter((c) => c.unread).length;
  }, [filteredConversations]);

  return (
    <MainLayout>
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Patient Conversations List */}
        <div className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Conversations
          </h2>
          <div className="space-y-2">
            {filteredConversations.length === 0 ? (
              <div className="text-sm text-slate-500 p-4">
                No conversations with connected patients
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full rounded-lg p-3 text-left transition-colors ${
                    selectedConvId === conv.id
                      ? "bg-sky-50 border border-sky-200"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={conv.avatar}
                      alt={conv.patientName}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm">
                        {conv.patientName}
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {conv.lastMessage}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {conv.lastTime}
                      </p>
                    </div>
                    {conv.unread && (
                      <div className="h-2 w-2 rounded-full bg-sky-500 mt-2" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-2">
          {selectedConversation || (filteredConversations.length === 0 && connectedPatients.size > 0) ? (
            <div className="rounded-lg border bg-white shadow-sm overflow-hidden flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="border-b bg-slate-50/50 p-4">
                {selectedConversation ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedConversation.avatar}
                      alt={selectedConversation.patientName}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {selectedConversation.patientName}
                      </h3>
                      <p className="text-xs text-slate-600">Patient</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-600 mb-3">Start a conversation with a connected patient</p>
                    <select
                      onChange={(e) => {
                        const patientEmail = e.target.value;
                        if (patientEmail) {
                          const existingConv = filteredConversations.find((c) => c.patientEmail === patientEmail);
                          if (existingConv) {
                            setSelectedConvId(existingConv.id);
                          } else {
                            // Create new conversation
                            const patient = Array.from(connectedPatients).find((p) => p === patientEmail);
                            if (patient) {
                              const patientData = PatientDataStorage.getPatientData(patientEmail);
                              const newConv: Conversation = {
                                id: `conv-${patientEmail}`,
                                patientEmail,
                                patientName: patientData?.fullName || patientEmail,
                                avatar: `https://i.pravatar.cc/40?img=${patientEmail.charCodeAt(0) % 70}`,
                                lastMessage: "",
                                lastTime: "",
                                unread: false,
                                messages: [],
                              };
                              setAllConversations((prev) => [...prev, newConv]);
                              setSelectedConvId(newConv.id);
                            }
                          }
                        }
                      }}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                    >
                      <option value="">Select a patient...</option>
                      {Array.from(connectedPatients).map((email) => {
                        const patient = Array.from(connectedPatients).find((p) => p === email);
                        const patientData = PatientDataStorage.getPatientData(email);
                        return (
                          <option key={email} value={email}>
                            {patientData?.fullName || email}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "doctor" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender === "doctor"
                          ? "bg-sky-600 text-white"
                          : "bg-slate-100 text-slate-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      {msg.attachment && (
                        <div className="mt-2 flex items-center gap-2 rounded bg-white/20 p-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-xs">{msg.attachment}</span>
                        </div>
                      )}
                      <p
                        className={`mt-1 text-xs ${
                          msg.sender === "doctor"
                            ? "text-sky-100"
                            : "text-slate-500"
                        }`}
                      >
                        {new Date(msg.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              {/* Message Input */}
              <div className="border-t bg-slate-50/50 p-4">
                <div className="flex items-end gap-3">
                  <button className="p-2 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type message..."
                    className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="rounded-md bg-sky-600 p-2 text-white hover:bg-sky-700"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-white p-12 text-center">
              <p className="text-slate-600">Select a conversation to start</p>
            </div>
          )}
        </div>

        {/* System Alerts */}
        <div className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            System Alerts
          </h2>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">No active alerts</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-lg border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {alert.icon}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">
                          {alert.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDismissAlert(alert.id)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
