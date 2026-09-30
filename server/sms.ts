/**
 * TextBee SMS Gateway Service (https://textbee.dev)
 * Relays OTP and transaction SMS messages through TextBee Android device gateway
 */

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveredViaTextBee: boolean;
}

export async function sendOtpViaTextBee(
  mobile: string,
  otpCode: string
): Promise<SendSmsResult> {
  const apiKey = process.env.TEXTBEE_API_KEY;
  const deviceId = process.env.TEXTBEE_DEVICE_ID;

  // Format recipient to standard E.164 (+91 for India)
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const recipient = `+91${cleanMobile}`;
  const smsBody = `[KrishiVaani / कृषिवाणी] आपका सत्यापन कोड (OTP) है: ${otpCode}। यह कोड 5 मिनट तक मान्य है। कृपया इसे किसी के साथ साझा न करें।`;

  if (apiKey && deviceId) {
    try {
      const url = `https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: [recipient],
          message: smsBody,
        }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log(`[TextBee] SMS dispatched successfully to +91-******${cleanMobile.slice(-4)}`);
        return {
          success: true,
          messageId: data.messageId || data.id,
          deliveredViaTextBee: true,
        };
      } else {
        const errText = await response.text().catch(() => '');
        console.warn(`[TextBee] Gateway returned HTTP ${response.status}: ${errText}`);
        return {
          success: false,
          error: `TextBee error (${response.status})`,
          deliveredViaTextBee: false,
        };
      }
    } catch (err: any) {
      console.warn('[TextBee] Network dispatch exception:', err.message);
      return {
        success: false,
        error: err.message,
        deliveredViaTextBee: false,
      };
    }
  }

  // When TextBee credentials are not yet configured in local environment
  console.log(`[SMS Simulation] To: ${recipient} | Text: ${smsBody}`);
  return {
    success: true,
    deliveredViaTextBee: false,
  };
}
