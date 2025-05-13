import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const serviceSid = process.env.TWILIO_SERVICE_SID!;
const client = twilio(accountSid, authToken);

/**
 * Sends an OTP code via SMS to the specified phone number.
 * @param phoneNumber - The recipient's phone number (e.g., '+4522232268').
 * @returns A promise that resolves with the verification SID.
 */
const sendOtp = async (phoneNumber: string): Promise<string> => {
    try {
      const verification = await client.verify.v2.services(serviceSid)
        .verifications
        .create({ to: phoneNumber, channel: 'sms' });
  
      return verification.sid; // Return the verification SID for tracking
    } catch (error) {
      throw new Error(`Failed to send OTP: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  /**
   * Verifies the OTP code sent to the specified phone number.
   * @param phoneNumber - The recipient's phone number (e.g., '+4522232268').
   * @param code - The OTP code to verify (e.g., '123456').
   * @returns A promise that resolves with the verification status.
   */
  const verifyOtp = async (phoneNumber: string, code: string): Promise<string> => {
    try {
      const verificationCheck = await client.verify.v2.services(serviceSid)
        .verificationChecks
        .create({ to: phoneNumber, code });
  
      return verificationCheck.status; // Return the verification status (e.g., 'approved' or 'pending')
    } catch (error) {
      throw new Error(`Failed to verify OTP: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
export { sendOtp, verifyOtp };