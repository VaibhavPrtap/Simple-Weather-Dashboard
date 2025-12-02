const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// API: /api/weather?city=City Name
app.get('/api/weather', async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: 'city query parameter is required' });

  try {
    // 1) Geocoding using Open-Meteo Geocoding API
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoResp = await fetch(geoUrl);
    if (!geoResp.ok) return res.status(502).json({ error: 'geocoding service error' });
    const geoJson = await geoResp.json();
    if (!geoJson.results || geoJson.results.length === 0) {
      return res.status(404).json({ error: 'city not found' });
    }
    const place = geoJson.results[0];
    const { latitude, longitude, name, country, timezone } = place;

    // 2) Weather using Open-Meteo Forecast API (current_weather)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;
    const weatherResp = await fetch(weatherUrl);
    if (!weatherResp.ok) return res.status(502).json({ error: 'weather service error' });
    const weatherJson = await weatherResp.json();

    return res.json({
      location: { name, country, latitude, longitude, timezone },
      weather: weatherJson.current_weather || null,
      raw: weatherJson
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
});

// fallback - serve index.html for any other route (single page)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
