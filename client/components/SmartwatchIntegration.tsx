import { useState, useEffect } from "react";
import { Watch, Activity, Zap, Moon, Heart } from "lucide-react";

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

  // Load smartwatch data from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vv_smartwatch");
      if (stored) {
        setSmartwatchData(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading smartwatch data:", e);
    }
  }, []);

  // Save smartwatch data to localStorage
  const saveSmartwatchData = (data: SmartwatchData) => {
    localStorage.setItem("vv_smartwatch", JSON.stringify(data));
    setSmartwatchData(data);
  };

  // Handle smartwatch connection
  const handleConnectSmartwatch = () => {
    // Simulate connecting smartwatch and syncing data
    const newData: SmartwatchData = {
      connected: true,
      lastSyncTime: new Date().toLocaleString(),
      vitals: {
        heartRate: 72 + Math.floor(Math.random() * 20),
        steps: 8500 + Math.floor(Math.random() * 3000),
        calories: 2100 + Math.floor(Math.random() * 500),
        sleepDuration: 7.5 + Math.random() * 1.5,
      },
    };
    saveSmartwatchData(newData);
  };

  // Handle smartwatch disconnection
  const handleDisconnectSmartwatch = () => {
    const newData = {
      ...smartwatchData,
      connected: false,
      lastSyncTime: "",
    };
    saveSmartwatchData(newData);
  };

  // Handle manual sync
  const handleSync = () => {
    if (smartwatchData.connected) {
      const updatedData = {
        ...smartwatchData,
        lastSyncTime: new Date().toLocaleString(),
        vitals: {
          heartRate: 72 + Math.floor(Math.random() * 20),
          steps: smartwatchData.vitals.steps + Math.floor(Math.random() * 500),
          calories: smartwatchData.vitals.calories + Math.floor(Math.random() * 150),
          sleepDuration: smartwatchData.vitals.sleepDuration + (Math.random() * 0.5),
        },
      };
      saveSmartwatchData(updatedData);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">
        Smartwatch Integration
      </h2>

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
              className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white font-medium hover:bg-sky-700 transition-colors"
            >
              Connect Smartwatch
            </button>
          ) : (
            <>
              <button
                onClick={handleSync}
                className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white font-medium hover:bg-sky-700 transition-colors"
              >
                Sync Now
              </button>
              <button
                onClick={handleDisconnectSmartwatch}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors"
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
                {smartwatchData.vitals.heartRate}
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
                {smartwatchData.vitals.steps.toLocaleString()}
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
                {smartwatchData.vitals.calories}
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
                {smartwatchData.vitals.sleepDuration.toFixed(1)}
              </div>
              <div className="text-xs text-purple-700 mt-1">hours</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
