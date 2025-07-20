import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function StrengthWeaknessChart({ token }) {
  const [data, setData] = useState({ labels: [], datasets: [] });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/problems', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const stats = (res.data || []).reduce((acc, prob) => {
          (prob.patterns || []).forEach(topic => {
            acc[topic] = acc[topic] || { solved: 0, needsRevision: 0, total: 0 };
            acc[topic].total += 1;
            if ((prob.status || []).includes('Solved')) acc[topic].solved += 1;
            if ((prob.status || []).includes('Needs Revision')) acc[topic].needsRevision += 1;
          });
          return acc;
        }, {});
        const topics = Object.keys(stats);
        setData({
          labels: topics.length ? topics : ['No Data'],
          datasets: [
            {
              label: '% Solved',
              data: topics.length ? topics.map(topic => (stats[topic].solved / stats[topic].total * 100) || 0) : [0],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              pointBackgroundColor: 'rgba(75, 192, 192, 1)',
              fill: true
            },
            {
              label: '% Needs Revision',
              data: topics.length ? topics.map(topic => (stats[topic].needsRevision / stats[topic].total * 100) || 0) : [0],
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              pointBackgroundColor: 'rgba(255, 99, 132, 1)',
              fill: true
            }
          ]
        });
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load stats');
        setData({
          labels: ['No Data'],
          datasets: [
            { label: '% Solved', data: [0], backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)', pointBackgroundColor: 'rgba(75, 192, 192, 1)', fill: true },
            { label: '% Needs Revision', data: [0], backgroundColor: 'rgba(255, 99, 132, 0.2)', borderColor: 'rgba(255, 99, 132, 1)', pointBackgroundColor: 'rgba(255, 99, 132, 1)', fill: true }
          ]
        });
      }
    };
    if (token) fetchStats();
  }, [token]);

  return (
    <div className="section">
      <h3>Strength & Weakness</h3>
      <p>Radar chart showing your performance across topics from journal entries.</p>
      {error && <p className="error">{error}</p>}
      <Radar
        data={data}
        options={{
          responsive: true,
          plugins: {
            title: { display: true, text: 'Topic Performance', color: '#333', font: { size: 16 } },
            legend: { labels: { color: '#333' } },
            tooltip: {
              backgroundColor: '#fff',
              titleColor: '#333',
              bodyColor: '#333',
              borderColor: '#ccc',
              borderWidth: 1,
              callbacks: { label: (context) => `${context.dataset.label}: ${context.raw.toFixed(2)}%` }
            }
          },
          scales: { r: { ticks: { color: '#333' }, grid: { color: '#eee' }, pointLabels: { color: '#333' } } },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const topic = data.labels[elements[0].index];
              if (topic !== 'No Data') navigate(`/journal?topic=${topic}`);
            }
          }
        }}
      />
    </div>
  );
}

export default StrengthWeaknessChart;