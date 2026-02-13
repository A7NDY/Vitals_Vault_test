import crypto from "crypto";

/**
 * Token Encryption Utility
 * Encrypts and decrypts sensitive tokens before database storage
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "vitals-vault-default-key-change-in-prod";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Derives a consistent 32-byte key from the encryption key
 */
function deriveKey(key: string): Buffer {
  return crypto
    .pbkdf2Sync(key, crypto.randomBytes(SALT_LENGTH), 100000, 32, "sha256")
    .slice(0, 32);
}

/**
 * Encrypts a token string
 * Returns base64 encoded string containing IV + salt + authTag + encrypted data
 */
export function encryptToken(token: string): string {
  try {
    if (!token) throw new Error("Token cannot be empty");

    const key = deriveKey(ENCRYPTION_KEY);
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(token, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Combine: iv + salt + authTag + encrypted data
    const combined = Buffer.concat([iv, salt, authTag, Buffer.from(encrypted, "hex")]);

    return combined.toString("base64");
  } catch (error) {
    console.error("Token encryption failed:", error);
    throw new Error("Failed to encrypt token");
  }
}

/**
 * Decrypts a previously encrypted token
 * Expects base64 encoded string with IV + salt + authTag + encrypted data
 */
export function decryptToken(encryptedToken: string): string {
  try {
    if (!encryptedToken) throw new Error("Encrypted token cannot be empty");

    const combined = Buffer.from(encryptedToken, "base64");

    // Extract components
    const iv = combined.slice(0, IV_LENGTH);
    const salt = combined.slice(IV_LENGTH, IV_LENGTH + SALT_LENGTH);
    const authTag = combined.slice(IV_LENGTH + SALT_LENGTH, IV_LENGTH + SALT_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.slice(IV_LENGTH + SALT_LENGTH + AUTH_TAG_LENGTH);

    // Derive key using the same process
    const key = crypto
      .pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, "sha256")
      .slice(0, 32);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.toString("hex"), "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Token decryption failed:", error);
    throw new Error("Failed to decrypt token");
  }
}

/**
 * Hash a token for verification (one-way)
 * Useful for comparing tokens without exposing the original value
 */
export function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

/**
 * Validate encryption key is set properly
 */
export function validateEncryptionSetup(): boolean {
  if (!process.env.ENCRYPTION_KEY) {
    console.warn(
      "⚠️  WARNING: ENCRYPTION_KEY environment variable not set. Using default key (unsafe for production)"
    );
    return false;
  }
  return true;
}

export default {
  encryptToken,
  decryptToken,
  hashToken,
  validateEncryptionSetup,
};
