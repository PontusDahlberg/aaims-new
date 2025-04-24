import { Client } from "@microsoft/microsoft-graph-client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { 
        status: 401 
      });
    }

    // Här behöver vi implementera Microsoft Graph API integration
    // Detta kräver ytterligare konfiguration i Next Auth för Microsoft-providern
    // och hantering av Microsoft 365 credentials

    const client = Client.init({
      authProvider: (done) => {
        done(null, msalAccessToken); // Requires Microsoft authentication
      }
    });

    const events = await client
      .api('/me/events')
      .select('subject,start,end,location,bodyPreview,attendees')
      .get();

    // Konvertera och synkronisera med Google Calendar
    // ...

    return new Response(JSON.stringify(events), { 
      status: 200 
    });
  } catch (error) {
    console.error('Error importing Outlook events:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500 
    });
  }
}
