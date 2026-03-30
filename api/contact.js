export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      fname = '',
      lname = '',
      email = '',
      phone = '',
      service = '',
      property = '',
      message = ''
    } = req.body || {};

    const firstName = String(fname).trim();
    const lastName = String(lname).trim();
    const senderEmail = String(email).trim();
    const phoneNumber = String(phone).trim();
    const requestedService = String(service).trim();
    const propertyType = String(property).trim();
    const projectMessage = String(message).trim();

    if (!firstName || !lastName || !senderEmail || !projectMessage) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(senderEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO;
    const fromEmail = process.env.CONTACT_FROM || 'Luso Painting Website <onboarding@resend.dev>';

    if (!resendApiKey || !toEmail) {
      return res.status(500).json({
        error: 'Missing server email configuration. Add RESEND_API_KEY and CONTACT_TO in Vercel environment variables.'
      });
    }

    const submittedAt = new Date().toLocaleString('en-CA', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Edmonton'
    });

    const textBody = [
      'New estimate request from the Luso Painting website',
      '',
      `Name: ${firstName} ${lastName}`,
      `Email: ${senderEmail}`,
      `Phone: ${phoneNumber || 'Not provided'}`,
      `Service Needed: ${requestedService || 'Not selected'}`,
      `Property Type: ${propertyType || 'Not selected'}`,
      `Submitted: ${submittedAt}`,
      '',
      'Project Details:',
      projectMessage
    ].join('\n');

    const htmlBody = `
      <h2>New estimate request from the Luso Painting website</h2>
      <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(senderEmail)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phoneNumber || 'Not provided')}</p>
      <p><strong>Service Needed:</strong> ${escapeHtml(requestedService || 'Not selected')}</p>
      <p><strong>Property Type:</strong> ${escapeHtml(propertyType || 'Not selected')}</p>
      <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
      <hr />
      <p><strong>Project Details:</strong></p>
      <p>${escapeHtml(projectMessage).replace(/\n/g, '<br>')}</p>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: senderEmail,
        subject: `New estimate request — ${firstName} ${lastName}`,
        text: textBody,
        html: htmlBody
      })
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      return res.status(502).json({ error: `Email provider error: ${resendError}` });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong while sending the message.' });
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
