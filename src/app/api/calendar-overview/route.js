import { google } from 'googleapis';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { 
        status: 401 
      });
    }

    const { startDate, endDate } = await req.json();

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date(startDate).toISOString(),
      timeMax: new Date(endDate).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return new Response(JSON.stringify({ 
      events: response.data.items || [] 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Calendar overview error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch calendar overview',
      details: error.message
    }), { 
      status: 500 
    });
  }
}
