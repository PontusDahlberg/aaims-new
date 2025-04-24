import { sendMail } from '@/utils/email';

export async function POST(req) {
  try {
    const { attendees, slots, organizerEmail } = await req.json();
    
    // Generera unik länk för varje deltagare
    const responses = await Promise.all(attendees.map(async (attendee) => {
      const responseToken = generateResponseToken(attendee, slots);
      const responseUrl = `${process.env.NEXT_PUBLIC_URL}/meeting-response/${responseToken}`;
      
      await sendMail({
        to: attendee,
        subject: 'Förfrågan om mötestid',
        html: generateEmailTemplate({
          organizerEmail,
          slots,
          responseUrl
        })
      });

      return { attendee, responseToken };
    }));

    return new Response(JSON.stringify({ success: true, responses }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error sending availability requests:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
}

function generateEmailTemplate({ organizerEmail, slots, responseUrl }) {
  return `
    <h2>Förfrågan om mötestid</h2>
    <p>${organizerEmail} vill boka ett möte med dig</p>
    <p>Föreslagna tider:</p>
    <ul>
      ${slots.map(slot => `
        <li>${new Date(slot.start).toLocaleString('sv-SE')} - 
            ${new Date(slot.end).toLocaleString('sv-SE')}</li>
      `).join('')}
    </ul>
    <a href="${responseUrl}" 
       style="display:inline-block; padding:10px 20px; background:#4CAF50; 
              color:white; text-decoration:none; border-radius:5px;">
      Svara på förfrågan
    </a>
  `;
}

function generateResponseToken(attendee, slots) {
  // Implementera säker token-generering
  return Buffer.from(JSON.stringify({
    attendee,
    slots: slots.map(s => s.id),
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 dagar
  })).toString('base64');
}
