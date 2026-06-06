const { google } = require("googleapis");

const createGmailClient = (interviewer) => {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  auth.setCredentials({
    access_token: interviewer.accessToken,
    refresh_token: interviewer.refreshToken,
  });

  return google.gmail({
    version: "v1",
    auth,
  });
};

const makeEmailRaw = ({ to, subject, html }) => {
  const message = [
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    html,
  ].join("\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const sendEmail = async ({ interviewer, to, subject, html }) => {
  const gmail = createGmailClient(interviewer);

  const raw = makeEmailRaw({
    to,
    subject,
    html,
  });

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
    },
  });

  return response.data;
};

const sendCandidateBookingEmail = async ({
  interviewer,
  candidateEmail,
  candidateName,
  slot,
  meetLink,
  cancelToken,
}) => {
  const html = `

    <p>
  <strong>Cancel Interview:</strong>
  <a href="${process.env.APP_BASE_URL}/api/public/bookings/cancel/${cancelToken}">
    Cancel your interview
  </a>
</p>
    <h2>Your interview is scheduled</h2>
    <p>Hello ${candidateName},</p>
    <p>Your interview with ${interviewer.name} has been scheduled.</p>

    <p><strong>Start:</strong> ${new Date(slot.startTime).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    })}</p>

    <p><strong>End:</strong> ${new Date(slot.endTime).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    })}</p>

    <p><strong>Google Meet:</strong> <a href="${meetLink}">${meetLink}</a></p>

    <p>Thank you.</p>
  `;

  return sendEmail({
    interviewer,
    to: candidateEmail,
    subject: "Interview Scheduled Confirmation",
    html,
  });
};

const sendInterviewerBookingEmail = async ({
  interviewer,
  candidateName,
  candidateEmail,
  slot,
  meetLink,
}) => {
  const html = `
    <h2>New interview booking</h2>
    <p>Hello ${interviewer.name},</p>
    <p>A candidate has booked one of your interview slots.</p>

    <p><strong>Candidate:</strong> ${candidateName}</p>
    <p><strong>Email:</strong> ${candidateEmail}</p>

    <p><strong>Start:</strong> ${new Date(slot.startTime).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    })}</p>

    <p><strong>End:</strong> ${new Date(slot.endTime).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    })}</p>

    <p><strong>Google Meet:</strong> <a href="${meetLink}">${meetLink}</a></p>
  `;

  return sendEmail({
    interviewer,
    to: interviewer.email,
    subject: "New Interview Booking",
    html,
  });
};


const sendCandidateCancellationEmail = async ({
  interviewer,
  candidateEmail,
  candidateName,
  slot,
  meetLink,
  cancelToken,
}) => {
  const html = `


    <h2>Interview Cancelled</h2>
    <p>Hello ${candidateName},</p>
    <p>Your interview with ${interviewer.name} has been cancelled.</p>

    <p><strong>Original Start:</strong> ${new Date(slot.startTime).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    })}</p>

    <p><strong>Original End:</strong> ${new Date(slot.endTime).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    })}</p>
  `;

  return sendEmail({
    interviewer,
    to: candidateEmail,
    subject: "Interview Cancellation Confirmation",
    html,
  });
};

const sendInterviewerCancellationEmail = async ({
  interviewer,
  candidateName,
  candidateEmail,
  slot,
}) => {
  const html = `
    <h2>Interview Cancelled</h2>
    <p>Hello ${interviewer.name},</p>
    <p>The candidate has cancelled their interview.</p>

    <p><strong>Candidate:</strong> ${candidateName}</p>
    <p><strong>Email:</strong> ${candidateEmail}</p>

    <p><strong>Original Start:</strong> ${new Date(slot.startTime).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    })}</p>

    <p><strong>Original End:</strong> ${new Date(slot.endTime).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    })}</p>
  `;

  return sendEmail({
    interviewer,
    to: interviewer.email,
    subject: "Candidate Cancelled Interview",
    html,
  });
};

module.exports = {
  sendCandidateBookingEmail,
  sendInterviewerBookingEmail,
  sendCandidateCancellationEmail,
  sendInterviewerCancellationEmail,
};