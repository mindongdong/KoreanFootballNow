import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const BATCH_SIZE = 100;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const secret = process.env.NEWSLETTER_SEND_SECRET;

  if (!secret) {
    console.error('Missing NEWSLETTER_SEND_SECRET');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { subject, html } = req.body || {};

  if (!subject || typeof subject !== 'string') {
    return res.status(400).json({ error: 'subject is required' });
  }

  if (!html || typeof html !== 'string') {
    return res.status(400).json({ error: 'html is required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !audienceId || !fromEmail) {
    console.error('Missing required environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const resend = new Resend(apiKey);

  // Fetch all contacts
  const { data: listData, error: listError } = await resend.contacts.list({ audienceId });

  if (listError) {
    console.error('Resend contacts.list error:', listError);
    return res.status(500).json({ error: 'Failed to fetch subscribers' });
  }

  const subscribers = listData?.data;

  if (!subscribers || subscribers.length === 0) {
    return res.status(200).json({ message: 'No subscribers found', sent: 0 });
  }

  const emails = subscribers
    .filter((c) => !c.unsubscribed)
    .map((c) => c.email);

  if (emails.length === 0) {
    return res.status(200).json({ message: 'No active subscribers', sent: 0 });
  }

  // Send in batches
  let totalSent = 0;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);

    const batchPayload = batch.map((email) => ({
      from: fromEmail,
      to: email,
      subject,
      html,
    }));

    const { error: sendError } = await resend.batch.send(batchPayload);

    if (sendError) {
      console.error('Resend batch.send error:', sendError);
      return res.status(500).json({
        error: 'Failed to send newsletter',
        sent: totalSent,
      });
    }

    totalSent += batch.length;
  }

  return res.status(200).json({
    message: 'Newsletter sent successfully',
    sent: totalSent,
  });
}
