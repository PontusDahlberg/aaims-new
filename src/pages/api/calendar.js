// src/pages/api/calendar.js
import { google } from 'googleapis';
import { getToken } from "next-auth/jwt";

const calendarId = process.env.CALENDAR_ID || "primary";

export default async function handler(req, res) {
  const token = await getToken({ req });

  if (!token || !token.accessToken) {
    console.error("No valid access token found");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { daysForward, daysBackward } = req.query;
    const forwardDays = parseInt(daysForward) || 60;
    const backwardDays = parseInt(daysBackward) || 7;

    const auth = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({ access_token: token.accessToken });

    const calendar = google.calendar({ version: "v3", auth });

    const now = new Date();
    const timeMin = req.query.daysBackward
      ? new Date(now.setDate(now.getDate() - backwardDays)).toISOString()
      : new Date().toISOString();
    const timeMax = req.query.daysBackward
      ? new Date().toISOString()
      : new Date(now.setDate(now.getDate() + forwardDays)).toISOString();

    console.log("Time range:", { timeMin, timeMax }); // Kontrollera att tidsintervallet är korrekt

    console.log("Fetching events from calendar:", calendarId);

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    console.log("Google Calendar API Response:", response.data);
    res.status(200).json({ events: response.data.items });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
}