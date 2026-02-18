import React, { useState, useEffect } from 'react';
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
          color: `hsl(${index * 36}, 70%, 60%)`
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
      <h2 className="section-title">📊 Top Artists Chart</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 70, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis 
              dataKey="name" 
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)' }}
            />
            <Tooltip 
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)'
              }}
              cursor={{ fill: 'rgba(66, 133, 244, 0.1)' }}
            />
            <Bar dataKey="plays" radius={[8, 8, 0, 0]}>
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
