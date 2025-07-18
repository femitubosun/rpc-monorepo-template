export const generateOtp = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};

export function getOtpExpiration() {
  return new Date(Date.now() + 1000 * 60 * 60);
}
