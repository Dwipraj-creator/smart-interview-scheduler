const { google } = require("googleapis");

const createCalendarClient = (interviewer) => {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  auth.setCredentials({
    access_token: interviewer.accessToken,
    refresh_token: interviewer.refreshToken,
  });

  return google.calendar({
    version: "v3",
    auth,
  });
};

const createInterviewEvent = async ({
  interviewer,
  slot,
  candidateName,
  candidateEmail,
  note,
}) => {
  const calendar = createCalendarClient(interviewer);

  const event = {
    summary: `Interview with ${candidateName}`,
    description: note || "Interview scheduled through Smart Interview Scheduler",
    start: {
      dateTime: slot.startTime,
    },
    end: {
      dateTime: slot.endTime,
    },
    attendees: [
      {
        email: candidateEmail,
      },
    ],
    conferenceData: {
      createRequest: {
        requestId: `meet-${slot._id}-${Date.now()}`,
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1,
    sendUpdates: "all",
  });

  return response.data;
};

module.exports = {
  createInterviewEvent,
};