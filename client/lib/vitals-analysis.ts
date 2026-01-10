/**
 * Vitals Analysis System
 * Calculates personalized thresholds and evaluates vitals against clinical limits
 */

export interface VitalReading {
  id: string;
  timestamp: string;
  heartRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  spO2?: number;
  weight?: number;
  bloodSugar?: number;
  symptoms?: string;
}

export interface VitalThresholds {
  lowerLimit: number;
  upperLimit: number;
}

export interface VitalAnalysis {
  vital: string;
  currentValue: number;
  lowerLimit: number;
  upperLimit: number;
  status: "Normal" | "Warning" | "Critical";
  reason: string;
  recommendedAction: string;
}

export interface PatientBaseline {
  age: number;
  gender: "Male" | "Female" | "Other";
  chronicConditions: {
    diabetes: boolean;
    hypertension: boolean;
    heartDisease: boolean;
    asthmaOrCOPD: boolean;
  };
  baselineHeartRate?: number;
  baselineSystolicBP?: number;
  baselineDiastolicBP?: number;
  baselineSpO2?: number;
}

class VitalsAnalyzer {
  /**
   * Calculate Maximum Heart Rate based on age
   */
  static calculateMHR(age: number): number {
    return 220 - age;
  }

  /**
   * Calculate Heart Rate thresholds
   */
  static getHeartRateThresholds(
    age: number,
    baselineHR?: number,
  ): VitalThresholds {
    if (baselineHR) {
      // Baseline adjustment: ±10% of baseline
      return {
        lowerLimit: Math.max(60, baselineHR * 0.9),
        upperLimit: Math.min(100, baselineHR * 1.1),
      };
    }

    // Standard calculation using MHR
    const mhr = this.calculateMHR(age);
    return {
      lowerLimit: Math.max(60, mhr * 0.5),
      upperLimit: Math.min(100, mhr * 0.85),
    };
  }

  /**
   * Calculate Blood Pressure thresholds
   */
  static getBloodPressureThresholds(
    baselineSBP?: number,
    baselineDBP?: number,
  ): {
    systolic: VitalThresholds;
    diastolic: VitalThresholds;
  } {
    if (baselineSBP && baselineDBP) {
      // Baseline adjustment: ±10%
      return {
        systolic: {
          lowerLimit: baselineSBP * 0.9,
          upperLimit: baselineSBP * 1.1,
        },
        diastolic: {
          lowerLimit: baselineDBP * 0.9,
          upperLimit: baselineDBP * 1.1,
        },
      };
    }

    // Standard clinical thresholds
    return {
      systolic: {
        lowerLimit: 90,
        upperLimit: 140,
      },
      diastolic: {
        lowerLimit: 60,
        upperLimit: 90,
      },
    };
  }

  /**
   * Calculate SpO2 thresholds
   */
  static getSpO2Thresholds(
    hasRespiratoryDisease: boolean,
    baselineSpO2?: number,
  ): VitalThresholds {
    if (baselineSpO2) {
      // Baseline adjustment
      return {
        lowerLimit: Math.max(hasRespiratoryDisease ? 88 : 95, baselineSpO2 - 2),
        upperLimit: 100,
      };
    }

    // Standard thresholds
    return {
      lowerLimit: hasRespiratoryDisease ? 88 : 95,
      upperLimit: 100,
    };
  }

  /**
   * Analyze Heart Rate reading
   */
  static analyzeHeartRate(
    currentHR: number,
    age: number,
    baselineHR?: number,
  ): VitalAnalysis {
    const thresholds = this.getHeartRateThresholds(age, baselineHR);
    let status: "Normal" | "Warning" | "Critical" = "Normal";
    let reason = "";
    let recommendedAction = "";

    if (currentHR < thresholds.lowerLimit) {
      status = "Critical";
      reason = `Heart rate is too low (${currentHR} bpm). Normal range is ${thresholds.lowerLimit.toFixed(0)}-${thresholds.upperLimit.toFixed(0)} bpm.`;
      recommendedAction = "Contact your doctor immediately. Bradycardia may indicate a serious condition.";
    } else if (currentHR > thresholds.upperLimit) {
      status = "Warning";
      reason = `Heart rate is elevated (${currentHR} bpm). Normal range is ${thresholds.lowerLimit.toFixed(0)}-${thresholds.upperLimit.toFixed(0)} bpm.`;
      recommendedAction = "Monitor your heart rate. Rest and avoid strenuous activities.";
    } else {
      reason = `Heart rate is normal (${currentHR} bpm).`;
      recommendedAction = "Continue regular monitoring.";
    }

    return {
      vital: "Heart Rate",
      currentValue: currentHR,
      lowerLimit: thresholds.lowerLimit,
      upperLimit: thresholds.upperLimit,
      status,
      reason,
      recommendedAction,
    };
  }

  /**
   * Analyze Systolic Blood Pressure
   */
  static analyzeSystolicBP(
    currentSBP: number,
    baselineSBP?: number,
  ): VitalAnalysis {
    const thresholds = this.getBloodPressureThresholds(baselineSBP);
    let status: "Normal" | "Warning" | "Critical" = "Normal";
    let reason = "";
    let recommendedAction = "";

    if (currentSBP < thresholds.systolic.lowerLimit) {
      status = "Critical";
      reason = `Systolic BP is too low (${currentSBP} mmHg). Normal range is ${thresholds.systolic.lowerLimit.toFixed(0)}-${thresholds.systolic.upperLimit.toFixed(0)} mmHg.`;
      recommendedAction = "Seek medical attention. Low blood pressure may cause dizziness or fainting.";
    } else if (currentSBP > thresholds.systolic.upperLimit) {
      status = "Warning";
      reason = `Systolic BP is elevated (${currentSBP} mmHg). Normal range is ${thresholds.systolic.lowerLimit.toFixed(0)}-${thresholds.systolic.upperLimit.toFixed(0)} mmHg.`;
      recommendedAction = "Monitor regularly. Consider stress reduction and consult your doctor.";
    } else {
      reason = `Systolic BP is normal (${currentSBP} mmHg).`;
      recommendedAction = "Continue regular monitoring.";
    }

    return {
      vital: "Systolic Blood Pressure",
      currentValue: currentSBP,
      lowerLimit: thresholds.systolic.lowerLimit,
      upperLimit: thresholds.systolic.upperLimit,
      status,
      reason,
      recommendedAction,
    };
  }

  /**
   * Analyze Diastolic Blood Pressure
   */
  static analyzeDiastolicBP(
    currentDBP: number,
    baselineDBP?: number,
  ): VitalAnalysis {
    const thresholds = this.getBloodPressureThresholds(undefined, baselineDBP);
    let status: "Normal" | "Warning" | "Critical" = "Normal";
    let reason = "";
    let recommendedAction = "";

    if (currentDBP < thresholds.diastolic.lowerLimit) {
      status = "Critical";
      reason = `Diastolic BP is too low (${currentDBP} mmHg). Normal range is ${thresholds.diastolic.lowerLimit.toFixed(0)}-${thresholds.diastolic.upperLimit.toFixed(0)} mmHg.`;
      recommendedAction = "Seek medical attention. Low blood pressure may cause dizziness or fainting.";
    } else if (currentDBP > thresholds.diastolic.upperLimit) {
      status = "Warning";
      reason = `Diastolic BP is elevated (${currentDBP} mmHg). Normal range is ${thresholds.diastolic.lowerLimit.toFixed(0)}-${thresholds.diastolic.upperLimit.toFixed(0)} mmHg.`;
      recommendedAction = "Monitor regularly. Consider stress reduction and consult your doctor.";
    } else {
      reason = `Diastolic BP is normal (${currentDBP} mmHg).`;
      recommendedAction = "Continue regular monitoring.";
    }

    return {
      vital: "Diastolic Blood Pressure",
      currentValue: currentDBP,
      lowerLimit: thresholds.diastolic.lowerLimit,
      upperLimit: thresholds.diastolic.upperLimit,
      status,
      reason,
      recommendedAction,
    };
  }

  /**
   * Analyze Oxygen Saturation
   */
  static analyzeSpO2(
    currentSpO2: number,
    hasRespiratoryDisease: boolean = false,
    baselineSpO2?: number,
  ): VitalAnalysis {
    const thresholds = this.getSpO2Thresholds(hasRespiratoryDisease, baselineSpO2);
    let status: "Normal" | "Warning" | "Critical" = "Normal";
    let reason = "";
    let recommendedAction = "";

    if (currentSpO2 < thresholds.lowerLimit) {
      status = "Critical";
      reason = `Oxygen saturation is too low (${currentSpO2}%). Normal range is ${thresholds.lowerLimit.toFixed(0)}-${thresholds.upperLimit.toFixed(0)}%.`;
      recommendedAction = "Seek immediate medical attention. Low oxygen levels are dangerous.";
    } else if (currentSpO2 > thresholds.upperLimit) {
      status = "Warning";
      reason = `Oxygen saturation is unusually high (${currentSpO2}%). This may indicate a sensor error.`;
      recommendedAction = "Check your pulse oximeter and retake the reading.";
    } else {
      reason = `Oxygen saturation is normal (${currentSpO2}%).`;
      recommendedAction = "Continue regular monitoring.";
    }

    return {
      vital: "Oxygen Saturation",
      currentValue: currentSpO2,
      lowerLimit: thresholds.lowerLimit,
      upperLimit: thresholds.upperLimit,
      status,
      reason,
      recommendedAction,
    };
  }

  /**
   * Analyze all vitals for a patient
   */
  static analyzeAllVitals(
    reading: VitalReading,
    patientData: PatientBaseline,
  ): VitalAnalysis[] {
    const analyses: VitalAnalysis[] = [];

    if (reading.heartRate !== undefined) {
      analyses.push(
        this.analyzeHeartRate(
          reading.heartRate,
          patientData.age,
          patientData.baselineHeartRate,
        ),
      );
    }

    if (reading.systolicBP !== undefined) {
      analyses.push(this.analyzeSystolicBP(reading.systolicBP, patientData.baselineSystolicBP));
    }

    if (reading.diastolicBP !== undefined) {
      analyses.push(this.analyzeDiastolicBP(reading.diastolicBP, patientData.baselineDiastolicBP));
    }

    if (reading.spO2 !== undefined) {
      analyses.push(
        this.analyzeSpO2(
          reading.spO2,
          patientData.chronicConditions.asthmaOrCOPD,
          patientData.baselineSpO2,
        ),
      );
    }

    return analyses;
  }

  /**
   * Check if any vital is critical or warning
   */
  static hasAlerts(analyses: VitalAnalysis[]): boolean {
    return analyses.some((a) => a.status !== "Normal");
  }

  /**
   * Get the highest severity alert
   */
  static getHighestSeverity(analyses: VitalAnalysis[]): "Normal" | "Warning" | "Critical" {
    if (analyses.some((a) => a.status === "Critical")) return "Critical";
    if (analyses.some((a) => a.status === "Warning")) return "Warning";
    return "Normal";
  }
}

export default VitalsAnalyzer;
