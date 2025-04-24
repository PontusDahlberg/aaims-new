import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { startBot } from "@/utils/bot";  // Uppdaterad import-sökväg

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { meetingUrl } = await req.json();
    const result = await startBot(meetingUrl, session);

    return new Response(JSON.stringify({ success: true, botId: result.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Bot Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
