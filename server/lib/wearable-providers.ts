/**
 * Wearable Provider Interface
 * Extensible architecture for supporting multiple wearable device providers
 * Currently supports: Google Fit
 * Future providers: Apple HealthKit, Fitbit, Garmin, Oura Ring
 */

export interface WearableVitals {
  heartRate?: number;
  steps?: number;
  calories?: number;
  sleepDuration?: number; // in minutes
  recordedAt: Date;
  source: "google_fit" | "apple_health" | "fitbit" | "garmin" | "oura";
  deviceName?: string;
  additionalData?: Record<string, unknown>;
}

export interface ProviderToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope: string[];
}

export interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

/**
 * Abstract base class for wearable providers
 */
export abstract class WearableProvider {
  protected provider: string;
  protected config: ProviderConfig;

  constructor(provider: string, config: ProviderConfig) {
    this.provider = provider;
    this.config = config;
  }

  /**
   * Get authorization URL for OAuth flow
   */
  abstract getAuthorizationUrl(state: string): string;

  /**
   * Exchange authorization code for tokens
   */
  abstract exchangeCodeForToken(code: string): Promise<ProviderToken>;

  /**
   * Refresh expired access token
   */
  abstract refreshToken(refreshToken: string): Promise<ProviderToken>;

  /**
   * Fetch vitals data from provider
   */
  abstract fetchVitals(token: ProviderToken, startDate: Date, endDate: Date): Promise<WearableVitals[]>;

  /**
   * Validate token is still valid
   */
  abstract isTokenValid(token: ProviderToken): boolean;

  /**
   * Revoke token (disconnect device)
   */
  abstract revokeToken(token: ProviderToken): Promise<void>;

  /**
   * Get human-readable provider name
   */
  getProviderName(): string {
    return this.provider;
  }

  /**
   * Validate configuration
   */
  protected validateConfig(): boolean {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error(`Invalid ${this.provider} configuration: missing credentials`);
    }
    return true;
  }
}

/**
 * Google Fit Provider Implementation
 */
export class GoogleFitProvider extends WearableProvider {
  private readonly GOOGLE_API_BASE = "https://www.googleapis.com";
  private readonly GOOGLE_OAUTH_BASE = "https://accounts.google.com/o/oauth2";

  constructor(config: ProviderConfig) {
    super("google_fit", config);
    this.validateConfig();
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: this.config.scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
      state,
    });

    return `${this.GOOGLE_OAUTH_BASE}/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<ProviderToken> {
    // This would be implemented with actual Google OAuth flow
    // Return placeholder for now
    return {
      accessToken: code, // Would exchange code for actual token
      refreshToken: "refresh_token_placeholder",
      expiresAt: new Date(Date.now() + 3600 * 1000),
      scope: this.config.scopes,
    };
  }

  async refreshToken(refreshToken: string): Promise<ProviderToken> {
    // Implement Google token refresh logic
    return {
      accessToken: "new_access_token",
      refreshToken,
      expiresAt: new Date(Date.now() + 3600 * 1000),
      scope: this.config.scopes,
    };
  }

  async fetchVitals(
    token: ProviderToken,
    startDate: Date,
    endDate: Date
  ): Promise<WearableVitals[]> {
    // Implement Google Fit API calls to fetch vitals
    // This would call:
    // - /fitness/v1/users/me/dataset:aggregate (for combined data)
    // - /fitness/v1/users/me/dataset/{datasetId}/dataset (for specific metrics)
    
    return []; // Placeholder
  }

  isTokenValid(token: ProviderToken): boolean {
    return new Date() < token.expiresAt;
  }

  async revokeToken(token: ProviderToken): Promise<void> {
    // Implement Google token revocation
    // Call: /o/oauth2/revoke with access_token
  }
}

/**
 * Apple HealthKit Provider Implementation (Future)
 */
export class AppleHealthProvider extends WearableProvider {
  constructor(config: ProviderConfig) {
    super("apple_health", config);
  }

  getAuthorizationUrl(state: string): string {
    // Apple HealthKit authorization flow
    throw new Error("Apple HealthKit integration coming soon");
  }

  async exchangeCodeForToken(code: string): Promise<ProviderToken> {
    throw new Error("Apple HealthKit integration coming soon");
  }

  async refreshToken(refreshToken: string): Promise<ProviderToken> {
    throw new Error("Apple HealthKit integration coming soon");
  }

  async fetchVitals(
    token: ProviderToken,
    startDate: Date,
    endDate: Date
  ): Promise<WearableVitals[]> {
    throw new Error("Apple HealthKit integration coming soon");
  }

  isTokenValid(token: ProviderToken): boolean {
    throw new Error("Apple HealthKit integration coming soon");
  }

  async revokeToken(token: ProviderToken): Promise<void> {
    throw new Error("Apple HealthKit integration coming soon");
  }
}

/**
 * Fitbit Provider Implementation (Future)
 */
export class FitbitProvider extends WearableProvider {
  constructor(config: ProviderConfig) {
    super("fitbit", config);
  }

  getAuthorizationUrl(state: string): string {
    throw new Error("Fitbit integration coming soon");
  }

  async exchangeCodeForToken(code: string): Promise<ProviderToken> {
    throw new Error("Fitbit integration coming soon");
  }

  async refreshToken(refreshToken: string): Promise<ProviderToken> {
    throw new Error("Fitbit integration coming soon");
  }

  async fetchVitals(
    token: ProviderToken,
    startDate: Date,
    endDate: Date
  ): Promise<WearableVitals[]> {
    throw new Error("Fitbit integration coming soon");
  }

  isTokenValid(token: ProviderToken): boolean {
    throw new Error("Fitbit integration coming soon");
  }

  async revokeToken(token: ProviderToken): Promise<void> {
    throw new Error("Fitbit integration coming soon");
  }
}

/**
 * Provider Factory
 * Creates provider instances based on provider name
 */
export class ProviderFactory {
  private static providers: Map<string, typeof WearableProvider> = new Map([
    ["google_fit", GoogleFitProvider],
    ["apple_health", AppleHealthProvider],
    ["fitbit", FitbitProvider],
  ]);

  static createProvider(
    providerName: string,
    config: ProviderConfig
  ): WearableProvider {
    const ProviderClass = this.providers.get(providerName);

    if (!ProviderClass) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    return new (ProviderClass as typeof WearableProvider)(config);
  }

  static getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  static isProviderAvailable(providerName: string): boolean {
    return this.providers.has(providerName);
  }

  /**
   * Register a new provider (for custom implementations)
   */
  static registerProvider(name: string, provider: typeof WearableProvider): void {
    this.providers.set(name, provider);
  }
}

export default {
  WearableProvider,
  GoogleFitProvider,
  AppleHealthProvider,
  FitbitProvider,
  ProviderFactory,
};
