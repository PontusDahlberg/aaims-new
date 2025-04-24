import { Client } from "@microsoft/microsoft-graph-client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { 
        status: 401 
      });
    }

    const searchParams = new URL(req.url).searchParams;
    const daysForward = parseInt(searchParams.get('daysForward')) || 60;
    const daysBackward = parseInt(searchParams.get('daysBackward')) || 7;

    const client = Client.init({
      authProvider: (done) => {
        done(null, session.accessToken);
      }
    });

    const now = new Date();
    const startTime = new Date(now.getTime() - (daysBackward * 24 * 60 * 60 * 1000));
    const endTime = new Date(now.getTime() + (daysForward * 24 * 60 * 60 * 1000));

    const response = await client
      .api('/me/calendar/events')
      .select('subject,start,end,location,bodyPreview,attendees,isOnlineMeeting,onlineMeeting')
      .filter(`start/dateTime ge '${startTime.toISOString()}' and end/dateTime le '${endTime.toISOString()}'`)
      .orderby('start/dateTime')
      .get();

    // Konvertera till samma format som Google Calendar events
    const events = response.value.map(event => ({
      id: event.id,
      summary: event.subject,
      description: event.bodyPreview,
      start: { dateTime: event.start.dateTime },
      end: { dateTime: event.end.dateTime },
      location: event.location?.displayName,
      conferenceLink: event.onlineMeeting?.joinUrl,
      conferenceType: 'teams',
      source: 'outlook'
    }));

    return new Response(JSON.stringify({ events }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching Outlook calendar:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500 
    });
  }
}
