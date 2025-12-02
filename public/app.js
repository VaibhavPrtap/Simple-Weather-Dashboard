const e = React.createElement;
const { useState } = React;

function App() {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  async function fetchWeather() {
    if (!city.trim()) {
      setError('Please enter a city name.');
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const resp = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if (!resp.ok) {
        const err = await resp.json().catch(()=>({error: 'unknown error'}));
        throw new Error(err.error || 'Request failed');
      }
      const json = await resp.json();
      setData(json);
    } catch (err) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }

  return e('div', { className: 'container' },
    e('h1', null, 'Weather Dashboard'),
    e('div', null,
      e('input', {
        type: 'text',
        placeholder: 'Enter city name',
        value: city,
        onChange: (ev) => setCity(ev.target.value),
        onKeyDown: (ev) => { if (ev.key === 'Enter') fetchWeather(); }
      })
    ),
    e('div', null,
      e('button', { onClick: fetchWeather }, loading ? 'Loading...' : 'Get Weather')
    ),
    error && e('div', { className: 'card', style: { borderColor: '#f44336' } }, e('div', null, 'Error'), e('div', { className: 'muted' }, error)),
    data && e('div', { className: 'card' },
      e('div', null, e('strong', null, data.location.name + (data.location.country ? (', ' + data.location.country) : ''))),
      e('div', { className: 'muted' }, `Lat: ${data.location.latitude}, Lon: ${data.location.longitude}`),
      e('hr'),
      data.weather ? e('div', null,
        e('div', null, `Temperature: ${data.weather.temperature}°C`),
        e('div', null, `Wind speed: ${data.weather.windspeed} m/s`),
        e('div', null, `Wind direction: ${data.weather.winddirection}°`),
        e('div', null, `Weather code: ${data.weather.weathercode}`),
        e('div', { className: 'muted' }, `Time (timezone: ${data.location.timezone || 'auto'}): ${data.weather.time}`)
      ) : e('div', null, 'No current weather available')
    )
  );
}

const domContainer = document.querySelector('#root');
ReactDOM.createRoot(domContainer).render(React.createElement(App));
