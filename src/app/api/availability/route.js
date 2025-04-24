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

    const { attendees, dateRange } = await req.json();

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const freeBusyRequest = {
      timeMin: new Date(dateRange.start).toISOString(),
      timeMax: new Date(dateRange.end).toISOString(),
      items: [
        { id: 'primary' },
        ...attendees.map(email => ({ id: email }))
      ]
    };

    const freeBusyResponse = await calendar.freebusy.query({
      requestBody: freeBusyRequest
    });

    return new Response(JSON.stringify({ 
      calendars: freeBusyResponse.data.calendars 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500 
    });
  }
}
