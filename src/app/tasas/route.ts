import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Aquí pon la URL real de tu backend donde estén los datos
    const res = await fetch('https://api-bcv-binance-tracker.vercel.app/api/tasas');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error al conectar' }, { status: 500 });
  }
}