import { NextResponse } from 'next/server';

export async function GET() {
  const formId = "xkolwoep"; 
  const apiKey = process.env.FORMSPREE_API_KEY;

  // API anahtarı yoksa hata dön
  if (!apiKey) {
    return NextResponse.json({ error: "API anahtarı yapılandırılmamış" }, { status: 500 });
  }

  try {
    const res = await fetch(`https://formspree.io/api/0/forms/${formId}/submissions`, {
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await res.json();
    
    return NextResponse.json({
      messages: data.submissions || [],
      messageCount: data.submissions?.length || 0,
      totalVisits: 1240 
    });
  } catch (error) {
    return NextResponse.json({ error: "Veri çekilemedi" }, { status: 500 });
  }
}