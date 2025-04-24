export async function sendAvailabilityRequest({ to, suggestedSlots, duration, organizerEmail }) {
  const response = await fetch('/api/send-mail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      subject: 'Förfrågan om mötestid',
      html: generateAvailabilityRequestEmail({
        suggestedSlots,
        duration,
        organizerEmail,
        responseUrl: generateResponseUrl(suggestedSlots, duration)
      })
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send availability request');
  }

  return response.json();
}

function generateAvailabilityRequestEmail({ suggestedSlots, duration, organizerEmail, responseUrl }) {
  return `
    <h2>Förfrågan om mötestid</h2>
    <p>${organizerEmail} vill boka ett möte med dig (${duration} minuter)</p>
    <p>Föreslagna tider:</p>
    <ul>
      ${suggestedSlots.map(slot => `
        <li>${new Date(slot.start).toLocaleString('sv-SE')} - 
            ${new Date(slot.end).toLocaleString('sv-SE')}</li>
      `).join('')}
    </ul>
    <p>Klicka här för att ange vilka tider som passar dig:</p>
    <a href="${responseUrl}" style="padding:10px 20px; background:#4CAF50; color:white; text-decoration:none; border-radius:5px;">
      Svara på förfrågan
    </a>
  `;
}

function generateResponseUrl(slots, duration) {
  const params = new URLSearchParams({
    slots: JSON.stringify(slots),
    duration
  });
  return `${process.env.NEXT_PUBLIC_URL}/meeting-response?${params}`;
}
