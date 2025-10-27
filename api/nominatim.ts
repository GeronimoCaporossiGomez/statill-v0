export default async function handler(req: any, res: any) {
  const https = require('https');

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

    https.get(nominatimUrl, {
      headers: {
        'User-Agent': 'StatillApp/1.0',
        'Accept': 'application/json'
      }
    }, (apiRes: any) => {
      let data = '';

      apiRes.on('data', (chunk: any) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        res.status(200).json(JSON.parse(data));
      });
    }).on('error', (error: any) => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to geocode' });
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to geocode' });
  }
}
