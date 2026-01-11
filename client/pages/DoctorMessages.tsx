import { useState, useEffect, useRef, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import DoctorRequestManager from "@/lib/doctor-requests";
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

const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    patientEmail: "sarah@example.com",
    patientName: "Sarah Miller",
    avatar: "https://i.pravatar.cc/150?img=47",
    lastMessage: "Thanks for the update!",
    lastTime: "2 hours ago",
    unread: true,
    messages: [
      {
        id: "m1",
        sender: "doctor",
        text: "Hi Sarah,\n\nhow are you feeling today?",
        time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "m2",
        sender: "patient",
        text: "Hi Dr. Emily Carter\n\nThanks for feeling the update, Any changes in blood sugar levels? Let's keep an eye on your readings.",
        time: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
        attachment: "Blood Test Results - 2024-01-15.pdf",
      },
      {
        id: "m3",
        sender: "doctor",
        text: "Sure, I've reviewed your latest test results. Everything looks good!",
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "m4",
        sender: "patient",
        text: "Thanks for the update!",
        time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "2",
    patientEmail: "john@example.com",
    patientName: "John Smith",
    avatar: "https://i.pravatar.cc/150?img=33",
    lastMessage: "Will do, thanks!",
    lastTime: "1 day ago",
    unread: false,
    messages: [
      {
        id: "m5",
        sender: "doctor",
        text: "Please continue taking your medication as prescribed.",
        time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "m6",
        sender: "patient",
        text: "Will do, thanks!",
        time: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "3",
    patientEmail: "emma@example.com",
    patientName: "Emma Davis",
    avatar: "https://i.pravatar.cc/150?img=23",
    lastMessage: "See you next week!",
    lastTime: "3 days ago",
    unread: false,
    messages: [
      {
        id: "m7",
        sender: "doctor",
        text: "How are your vitals looking this week?",
        time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "m8",
        sender: "patient",
        text: "See you next week!",
        time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

const SYSTEM_ALERTS: SystemAlert[] = [
  {
    id: "a1",
    type: "alert",
    title: "AI Alert: Elevated Blood Pressure",
    description: "Patient's BP has been consistently high for the past 3 days.",
    icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
  },
  {
    id: "a2",
    type: "appointment",
    title: "Appointment Reminder",
    description: "Appointment scheduled for tomorrow at 10:00 AM.",
    icon: <Calendar className="h-5 w-5 text-blue-500" />,
  },
  {
    id: "a3",
    type: "report",
    title: "New Report Notification",
    description: "New blood test report available for review.",
    icon: <FileText className="h-5 w-5 text-green-500" />,
  },
];

function loadDoctorConversations() {
  try {
    const raw = localStorage.getItem("vv_doctor_conversations");
    return raw ? (JSON.parse(raw) as Conversation[]) : SAMPLE_CONVERSATIONS;
  } catch (e) {
    return SAMPLE_CONVERSATIONS;
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
  const [alerts, setAlerts] = useState<SystemAlert[]>(SYSTEM_ALERTS);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Load connected patients
  useEffect(() => {
    if (user?.email) {
      const patients = DoctorRequestManager.getAcceptedPatientsForDoctor(user.email);
      setConnectedPatients(new Set(patients.map((p) => p.email)));
    }
  }, [user?.email]);

  useEffect(() => persistDoctorConversations(allConversations), [allConversations]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConvId, allConversations]);

  if (!user || user.role !== "Doctor") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Access denied</p>
        </div>
      </MainLayout>
    );
  }

  // Filter conversations to only show connected patients
  const filteredConversations = useMemo(() => {
    return allConversations.filter((conv) => connectedPatients.has(conv.patientEmail));
  }, [allConversations, connectedPatients]);

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConvId && filteredConversations.length > 0) {
      setSelectedConvId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedConvId]);

  const selectedConversation = useMemo(
    () => filteredConversations.find((c) => c.id === selectedConvId),
    [filteredConversations, selectedConvId],
  );

  function handleSendMessage() {
    const trimmed = messageText.trim();
    if (!trimmed || !selectedConversation) return;

    const newMessage: DoctorMessage = {
      id: Date.now().toString(),
      sender: "doctor",
      text: trimmed,
      time: new Date().toISOString(),
    };

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

  const unreadCount = useMemo(
    () => filteredConversations?.filter((c) => c.unread).length || 0,
    [filteredConversations],
  );

  return (
    <MainLayout>
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Patient Conversations List */}
        <div className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Conversations
          </h2>
          <div className="space-y-2">
            {filteredConversations.map((conv) => (
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
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <div className="rounded-lg border bg-white shadow-sm overflow-hidden flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="border-b bg-slate-50/50 p-4">
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
