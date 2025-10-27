export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { q, format = 'json', limit = '1', addressdetails = '1', countrycodes = 'ar' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=${format}&limit=${limit}&addressdetails=${addressdetails}&countrycodes=${countrycodes}`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'StatillApp/1.0',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to geocode' });
  }
}
