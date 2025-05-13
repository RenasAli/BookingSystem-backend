import {Router} from 'express';
import * as SmsService from "../service/sms.service";

const smsRouter = Router();

// Send OTP
smsRouter.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const sid = await SmsService.sendOtp(phoneNumber);
    res.status(200).json({ sid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP
smsRouter.post('/verify-otp', async (req, res) => {
  const { phoneNumber, code } = req.body;

  try {
    const status = await SmsService.verifyOtp(phoneNumber, code);
    res.status(200).json({ status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default smsRouter;