import crypto from 'crypto';

export const generateOtp = (): string => {
  const otp = crypto.randomInt(100000, 999999).toString();
  return otp.toString();
};

export const otpExpiry = (): Date => {
  const now = new Date();
  return new Date(now.setMinutes(now.getMinutes() + 5));
};