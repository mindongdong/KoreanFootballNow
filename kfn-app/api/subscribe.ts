import type { VercelRequest, VercelResponse } from '@vercel/node';
import { join } from 'path';
import { Resend } from 'resend';
import { findLatestNewsletter, buildNewsletter } from '../newsletters/core.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '허용되지 않는 메서드입니다.' });
  }

  const { email } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: '이메일 주소를 입력해주세요.' });
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return res.status(400).json({ error: '올바른 이메일 주소를 입력해주세요.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.error('Missing RESEND_API_KEY or RESEND_AUDIENCE_ID');
    return res.status(500).json({ error: '서버 설정 오류입니다. 관리자에게 문의해주세요.' });
  }

  const resend = new Resend(apiKey);

  // Check if already subscribed
  const { data: listData, error: listError } = await resend.contacts.list({ audienceId });

  if (listError) {
    console.error('Resend contacts.list error:', listError);
    return res.status(500).json({ error: '구독 처리 중 오류가 발생했습니다.' });
  }

  const existing = listData?.data?.find(
    (c) => c.email.toLowerCase() === trimmedEmail
  );

  if (existing) {
    return res.status(409).json({ error: '이미 구독 중인 이메일입니다.' });
  }

  // Create contact
  const { error: createError } = await resend.contacts.create({
    email: trimmedEmail,
    audienceId,
  });

  if (createError) {
    console.error('Resend contacts.create error:', createError);
    return res.status(500).json({ error: '구독 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
  }

  // Best-effort: send latest newsletter to new subscriber
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (fromEmail) {
      const newslettersDir = join(__dirname, '..', 'newsletters');
      const latestMdPath = findLatestNewsletter(newslettersDir);
      if (latestMdPath) {
        const { subject, html } = buildNewsletter(latestMdPath, newslettersDir);
        await resend.emails.send({ from: fromEmail, to: trimmedEmail, subject, html });
      }
    }
  } catch (err) {
    console.error('Failed to send welcome newsletter:', err);
  }

  return res.status(200).json({ message: '구독이 완료되었습니다!' });
}
