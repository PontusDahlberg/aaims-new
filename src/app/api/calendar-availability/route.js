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

    const { attendees, duration, startDate, endDate } = await req.json();

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Hämta tillgänglighet för alla deltagare
    const freeBusyResponse = await calendar.freebusy.query({
      requestBody: {
        timeMin: new Date(startDate).toISOString(),
        timeMax: new Date(endDate).toISOString(),
        items: [
          { id: 'primary' }, // Arrangörens kalender
          ...attendees.map(email => ({ id: email })) // Deltagarnas kalendrar
        ]
      }
    });

    // Hitta lediga tider som passar alla
    const availableSlots = findAvailableSlots(
      freeBusyResponse.data.calendars,
      new Date(startDate),
      new Date(endDate),
      duration
    );

    return new Response(JSON.stringify({ availableSlots }), {
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

function generateAvailableSlots(startDate, endDate, busySlots, duration, workingHours) {
  const durationMs = duration * 60 * 1000;
  const availableSlots = [];
  let currentTime = new Date(startDate);

  while (currentTime < endDate) {
    const slotEnd = new Date(currentTime.getTime() + durationMs);
    
    if (isWithinWorkingHours(currentTime, workingHours) && 
        isWithinWorkingHours(slotEnd, workingHours) &&
        !isSlotBusy(currentTime, slotEnd, busySlots)) {
      availableSlots.push({
        start: currentTime.toISOString(),
        end: slotEnd.toISOString()
      });
    }
    
    currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30 min intervals
  }

  return availableSlots;
}

function isWithinWorkingHours(date, { startHour, startMinute, endHour, endMinute }) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;
  
  const dayOfWeek = date.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5 && 
         timeInMinutes >= startTimeInMinutes && 
         timeInMinutes <= endTimeInMinutes;
}

function isSlotBusy(start, end, busySlots) {
  return busySlots.some(busy => {
    const busyStart = new Date(busy.start);
    const busyEnd = new Date(busy.end);
    return (start < busyEnd && end > busyStart);
  });
}
