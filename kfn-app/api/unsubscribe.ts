import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

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
    return res.status(500).json({ error: '서버 설정 오류입니다.' });
  }

  const resend = new Resend(apiKey);

  // Find contact by email
  const { data: listData, error: listError } = await resend.contacts.list({ audienceId });

  if (listError) {
    console.error('Resend contacts.list error:', listError);
    return res.status(500).json({ error: '구독 해지 처리 중 오류가 발생했습니다.' });
  }

  const contact = listData?.data?.find(
    (c) => c.email.toLowerCase() === trimmedEmail
  );

  if (!contact) {
    return res.status(404).json({ error: '해당 이메일로 구독 내역을 찾을 수 없습니다.' });
  }

  const { error: removeError } = await resend.contacts.remove({
    id: contact.id,
    audienceId,
  });

  if (removeError) {
    console.error('Resend contacts.remove error:', removeError);
    return res.status(500).json({ error: '구독 해지 처리 중 오류가 발생했습니다.' });
  }

  return res.status(200).json({ message: '구독이 해지되었습니다.' });
}
