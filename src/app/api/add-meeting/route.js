import { google } from 'googleapis';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const meetingDetails = await req.json();

    // Konvertera tider till rätt format med svensk tidszon och offset
    const start = new Date(meetingDetails.start.dateTime);
    const end = new Date(meetingDetails.end.dateTime);
    const tzOffset = new Date().getTimezoneOffset();
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: meetingDetails.summary,
      description: meetingDetails.description,
      start: { 
        dateTime: new Date(start.getTime() - tzOffset * 60000).toISOString(),
        timeZone: 'Europe/Stockholm' // Explicit svensk tidszon
      },
      end: { 
        dateTime: new Date(end.getTime() - tzOffset * 60000).toISOString(),
        timeZone: 'Europe/Stockholm'
      },
      attendees: meetingDetails.attendees,
    };

    if (meetingDetails.location) {
      event.location = meetingDetails.location;
    }

    if (meetingDetails.conferenceData) {
      event.conferenceData = meetingDetails.conferenceData;
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
    });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Add Meeting Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create meeting',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
