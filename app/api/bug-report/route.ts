import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const recipient = process.env.BUG_REPORT_TO || 'ilker.tuna6134@gmail.com';
const storePath = path.join(process.cwd(), 'data', 'bug-reports.json');

type BugReportPayload = {
  bookTitle?: string;
  pageNumber?: number;
  description?: string;
  reporterEmail?: string;
  screenshot?: string;
  url?: string;
};

async function saveLocally(report: Record<string, unknown>) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  let reports: Record<string, unknown>[] = [];
  try {
    reports = JSON.parse(await fs.readFile(storePath, 'utf8'));
    if (!Array.isArray(reports)) reports = [];
  } catch {
    reports = [];
  }
  reports.unshift(report);
  await fs.writeFile(storePath, JSON.stringify(reports, null, 2), 'utf8');
}

async function sendEmail(report: Record<string, unknown>, screenshot: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const screenshotBase64 = screenshot.replace(/^data:image\/png;base64,/, '');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.BUG_REPORT_FROM || 'Mikatinur Hata Bildirim <onboarding@resend.dev>',
      to: [recipient],
      reply_to: report.reporterEmail || undefined,
      subject: `Mikatinur hata bildirimi: ${report.bookTitle} / s. ${report.pageNumber}`,
      html: `
        <h2>Yeni hata bildirimi</h2>
        <p><strong>Kitap:</strong> ${report.bookTitle}</p>
        <p><strong>Sayfa:</strong> ${report.pageNumber}</p>
        <p><strong>Adres:</strong> ${report.url}</p>
        <p><strong>Açıklama:</strong></p>
        <p>${String(report.description).replace(/\n/g, '<br>')}</p>
        <p><strong>Bildiren:</strong> ${report.reporterEmail || 'Belirtilmedi'}</p>
      `,
      attachments: [{ filename: 'hata-ekrani.png', content: screenshotBase64 }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Bug report email rejected by Resend:', response.status, errorBody);
  }

  return response.ok;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BugReportPayload;
    if (!body.bookTitle || !body.pageNumber || !body.description || !body.screenshot) {
      return NextResponse.json({ ok: false, error: 'Eksik hata bildirimi bilgisi' }, { status: 400 });
    }

    const report = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      bookTitle: body.bookTitle,
      pageNumber: body.pageNumber,
      description: body.description,
      reporterEmail: body.reporterEmail || '',
      url: body.url || '',
      recipient,
    };

    const emailed = await sendEmail(report, body.screenshot);
    await saveLocally({ ...report, emailed });

    return NextResponse.json({ ok: true, emailed });
  } catch {
    return NextResponse.json({ ok: false, error: 'Hata bildirimi kaydedilemedi' }, { status: 500 });
  }
}
