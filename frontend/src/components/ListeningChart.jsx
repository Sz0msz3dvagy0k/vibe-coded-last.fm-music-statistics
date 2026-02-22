import { useState, useEffect } from 'react';
import { lastfmAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './ListeningChart.css';

const ListeningChart = ({ period }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const data = await lastfmAPI.getTopArtists(period, 10);
        const formatted = data.topartists.artist.map((artist, index) => ({
          name: artist.name.length > 15 ? artist.name.substring(0, 15) + '...' : artist.name,
          plays: parseInt(artist.playcount),
          // Pixel-art palette: alternate mint/accent/off-white tones
          color: ['#78FECF','#BF4E30','#5fc8a0','#4dca9e','#9a3a20','#7ab08a','#78FECF','#BF4E30','#5fc8a0','#4dca9e'][index % 10]
        }));
        setChartData(formatted);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchChartData();
  }, [period]);

  if (loading) {
    return (
      <div className="card">
        <h2>Listening Activity</h2>
        <div className="skeleton" style={{ height: '300px' }} />
      </div>
    );
  }

  return (
      <div className="card slide-in">
      <h2 className="section-title">▓ Top Artists Chart</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={370}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 110, left: 8 }}>
            <CartesianGrid strokeDasharray="0" stroke="rgba(120,254,207,0.12)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#78FECF"
              tick={{ fill: '#78FECF', fontSize: 10, fontFamily: "'Pixelify Sans', monospace" }}
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              dy={4}
            />
            <YAxis 
              stroke="#78FECF"
              tick={{ fill: '#78FECF', fontSize: 10, fontFamily: "'Pixelify Sans', monospace" }}
            />
            <Tooltip 
              contentStyle={{
                background: '#093824',
                border: '2px solid #78FECF',
                borderRadius: '0',
                color: '#E5EAFA',
                fontFamily: "'Pixelify Sans', monospace",
                fontSize: '0.8rem',
                boxShadow: '3px 3px 0 #041a10'
              }}
              cursor={{ fill: 'rgba(120,254,207,0.08)' }}
            />
            <Bar dataKey="plays" radius={[0, 0, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ListeningChart;
