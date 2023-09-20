import twilio from "twilio";

export const sendOtp = async (mobile, otp) => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.messages.create({
    body: `your otp is ${otp} `,
    from: "+16187047333",
    to: mobile,
  });
};
