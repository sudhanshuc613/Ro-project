import { NextRequest, NextResponse } from 'next/server';
import { suggestProducts, logSearch } from '@/server/services/product.service';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ items: [] });

  try {
    const items = await suggestProducts(q, 6);
    void logSearch(q, items.length);
    return NextResponse.json({ items });
  } catch (err) {
    console.error('[search/suggest]', err);
    return NextResponse.json({ items: [] });
  }
}
