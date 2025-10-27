import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { q, format, limit, addressdetails, countrycodes } = req.query;

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.append('q', q as string);
    url.searchParams.append('format', format as string || 'json');
    url.searchParams.append('limit', limit as string || '1');
    url.searchParams.append('addressdetails', addressdetails as string || '1');
    url.searchParams.append('countrycodes', countrycodes as string || 'ar');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'StatillApp/1.0 (contact@statill.com)',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Geocoding failed' });
  }
}
