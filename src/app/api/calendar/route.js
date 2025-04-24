import { google } from 'googleapis';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.error('No session found');
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!session.accessToken) {
      console.error('No access token in session');
      return new Response(JSON.stringify({ error: 'No access token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const searchParams = new URL(req.url).searchParams;
    const daysForward = parseInt(searchParams.get('daysForward')) || 60;
    const daysBackward = parseInt(searchParams.get('daysBackward')) || 7;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken
    });

    const calendar = google.calendar({ 
      version: 'v3', 
      auth: oauth2Client 
    });

    // Get upcoming events
    const now = new Date();
    const upcomingTimeMin = now.toISOString();
    const upcomingTimeMax = new Date(now.getTime() + (daysForward * 24 * 60 * 60 * 1000)).toISOString();

    const upcomingEvents = await calendar.events.list({
      calendarId: 'primary',
      timeMin: upcomingTimeMin,
      timeMax: upcomingTimeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    // Get past events
    const pastTimeMax = now.toISOString();
    const pastTimeMin = new Date(now.getTime() - (daysBackward * 24 * 60 * 60 * 1000)).toISOString();

    const pastEvents = await calendar.events.list({
      calendarId: 'primary',
      timeMin: pastTimeMin,
      timeMax: pastTimeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return new Response(JSON.stringify({
      upcoming: upcomingEvents.data.items || [],
      past: pastEvents.data.items || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Calendar API Error:', error);
    
    // More detailed error handling
    if (error.code === 401) {
      return new Response(JSON.stringify({ 
        error: 'Authentication failed', 
        details: 'Token may have expired' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Failed to fetch calendar events',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
