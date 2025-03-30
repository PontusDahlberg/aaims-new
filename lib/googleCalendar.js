// src/lib/googleCalendar.js
import { google } from 'googleapis';

export async function getGoogleCalendarEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const res = await calendar.events.list({
      calendarId: 'primary', // Hämtar möten från användarens primära kalender
      timeMin: (new Date()).toISOString(), // Kommande möten
      maxResults: 10, // Hämta max 10 möten
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.data.items;
  } catch (error) {
    console.error('The API returned an error: ' + error);
    return [];
  }
}
