import { useState, useEffect } from "react";
import { Watch, Activity, Zap, Moon, Heart, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SmartwatchData = {
  connected: boolean;
  lastSyncTime: string;
  vitals: {
    heartRate: number;
    steps: number;
    calories: number;
    sleepDuration: number;
  };
};

export default function SmartwatchIntegration() {
  const { toast } = useToast();
  const [smartwatchData, setSmartwatchData] = useState<SmartwatchData>({
    connected: false,
    lastSyncTime: "",
    vitals: {
      heartRate: 0,
      steps: 0,
      calories: 0,
      sleepDuration: 0,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check smartwatch connection status on component mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  /**
   * Get authentication headers from current session
   */
  function getAuthHeaders(): Record<string, string> {
    try {
      const user = JSON.parse(localStorage.getItem("vv_user") || "{}");
      return {
        "Content-Type": "application/json",
        "x-user-email": user.email || "",
        "x-user-role": user.role || "Patient",
      };
    } catch {
      return {
        "Content-Type": "application/json",
      };
    }
  }

  // Check connection status from API
  const checkConnectionStatus = async () => {
    try {
      setIsCheckingStatus(true);
      setError(null);

      const response = await fetch("/api/vitals/status", {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        // If 401 or not found, smartwatch not connected
        if (response.status === 401 || response.status === 404) {
          setSmartwatchData((prev) => ({
            ...prev,
            connected: false,
            lastSyncTime: "",
          }));
          setIsCheckingStatus(false);
          return;
        }
        throw new Error(`Failed to check smartwatch status (${response.status})`);
      }

      const data = await response.json();

      if (data.connected) {
        setSmartwatchData((prev) => ({
          ...prev,
          connected: true,
          lastSyncTime: data.lastSyncTime
            ? new Date(data.lastSyncTime).toLocaleString()
            : prev.lastSyncTime,
          vitals: data.vitals ? {
            heartRate: data.vitals.heartRate || prev.vitals.heartRate,
            steps: data.vitals.steps || prev.vitals.steps,
            calories: data.vitals.calories || prev.vitals.calories,
            sleepDuration: data.vitals.sleepDuration || prev.vitals.sleepDuration,
          } : prev.vitals,
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Error checking smartwatch status:", errorMessage);
      setError("Could not check smartwatch status. Please try again later.");
      setSmartwatchData((prev) => ({
        ...prev,
        connected: false,
        lastSyncTime: "",
      }));
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Handle redirect to Google Fit authentication
  const handleConnectSmartwatch = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Call API to get authorization URL
      const response = await fetch("/api/auth/google-fit", {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate authentication");
      }

      const data = await response.json();

      // Redirect to Google's authorization URL
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error("No authorization URL returned");
      }
    } catch (err) {
      console.error("Error connecting smartwatch:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Failed to connect to Google Fit";
      setError(errorMsg);
      toast({
        title: "Connection Error",
        description: errorMsg + ". Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Handle smartwatch disconnection
  const handleDisconnectSmartwatch = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Call API to disconnect (optional - depends on backend implementation)
      const response = await fetch("/api/auth/google-fit/disconnect", {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setSmartwatchData({
          connected: false,
          lastSyncTime: "",
          vitals: {
            heartRate: 0,
            steps: 0,
            calories: 0,
            sleepDuration: 0,
          },
        });

        toast({
          title: "Disconnected",
          description: "Smartwatch disconnected successfully.",
        });
      } else {
        throw new Error("Failed to disconnect smartwatch");
      }
    } catch (err) {
      console.error("Error disconnecting smartwatch:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Failed to disconnect smartwatch";
      setError(errorMsg);
      toast({
        title: "Disconnection Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sync latest vitals from smartwatch
  const handleSyncLatestVitals = async () => {
    try {
      setError(null);
      setIsSyncing(true);

      const response = await fetch("/api/vitals/fetch", {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch latest vitals");
      }

      const data = await response.json();

      // Update smartwatch data with latest vitals
      setSmartwatchData((prev) => ({
        ...prev,
        lastSyncTime: new Date().toLocaleString(),
        vitals: {
          heartRate: data.vitals?.heartRate || prev.vitals.heartRate,
          steps: data.vitals?.steps || prev.vitals.steps,
          calories: data.vitals?.calories || prev.vitals.calories,
          sleepDuration: data.vitals?.sleepDuration || prev.vitals.sleepDuration,
        },
      }));

      toast({
        title: "Sync Successful",
        description: "Latest vitals synced from your smartwatch.",
      });
    } catch (err) {
      console.error("Error syncing vitals:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Failed to sync vitals";
      setError(errorMsg);
      toast({
        title: "Sync Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Smartwatch Integration
        </h2>
        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200 flex items-center justify-center h-32">
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Checking smartwatch status...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">
        Smartwatch Integration
      </h2>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Connection Card */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Watch className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-medium text-slate-900">
                Connect Your Smartwatch
              </h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Sync your heart rate, steps, calories, and sleep data automatically.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                smartwatchData.connected
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <span
                className={`mr-2 h-2 w-2 rounded-full ${
                  smartwatchData.connected ? "bg-green-600" : "bg-red-600"
                }`}
              />
              {smartwatchData.connected ? "Connected" : "Not Connected"}
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          {!smartwatchData.connected ? (
            <button
              onClick={handleConnectSmartwatch}
              disabled={isLoading}
              className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Connect Smartwatch
            </button>
          ) : (
            <>
              <button
                onClick={handleSyncLatestVitals}
                disabled={isLoading || isSyncing}
                className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSyncing && <Loader2 className="w-4 h-4 animate-spin" />}
                Sync Latest Vitals
              </button>
              <button
                onClick={handleDisconnectSmartwatch}
                disabled={isLoading || isSyncing}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Disconnect
              </button>
            </>
          )}
        </div>

        {smartwatchData.connected && smartwatchData.lastSyncTime && (
          <p className="mt-3 text-xs text-slate-500">
            Last synced: {smartwatchData.lastSyncTime}
          </p>
        )}
      </div>

      {/* Wearable Vitals Card */}
      {smartwatchData.connected && (
        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            Wearable Vitals
          </h3>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* Heart Rate */}
            <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                  Heart Rate
                </span>
                <Heart className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-900">
                {smartwatchData.vitals.heartRate || "—"}
              </div>
              <div className="text-xs text-red-700 mt-1">BPM</div>
            </div>

            {/* Steps */}
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Steps Today
                </span>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {smartwatchData.vitals.steps > 0
                  ? smartwatchData.vitals.steps.toLocaleString()
                  : "—"}
              </div>
              <div className="text-xs text-blue-700 mt-1">steps</div>
            </div>

            {/* Calories */}
            <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
                  Calories Burned
                </span>
                <Zap className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {smartwatchData.vitals.calories || "—"}
              </div>
              <div className="text-xs text-orange-700 mt-1">kcal</div>
            </div>

            {/* Sleep Duration */}
            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Sleep Duration
                </span>
                <Moon className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {smartwatchData.vitals.sleepDuration > 0
                  ? smartwatchData.vitals.sleepDuration.toFixed(1)
                  : "—"}
              </div>
              <div className="text-xs text-purple-700 mt-1">hours</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
