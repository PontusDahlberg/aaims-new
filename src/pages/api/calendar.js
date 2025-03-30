// src/pages/api/calendar.js
import { google } from 'googleapis';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: session.accessToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.status(200).json({ events: response.data.items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching events' });
  }
}
