import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CalendarHeatmap({ token }) {
  const [activity, setActivity] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateProblems, setDateProblems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await axios.get('/api/problems', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const problems = res.data || [];
        const range = 30;
        const activityMap = problems.reduce((acc, prob) => {
          const date = new Date(prob.solvedDate || Date.now()).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
        const activityData = Array(range).fill().map((_, i) => {
          const date = new Date(Date.now() - (range - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          return { date, count: activityMap[date] || 0 };
        });
        setActivity(activityData);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load activity');
        setActivity(Array(30).fill().map((_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: 0
        })));
      }
    };
    if (token) fetchActivity();
  }, [token]);

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    try {
      const start = new Date(date);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      const res = await axios.get('/api/problems', {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate: start.toISOString(), endDate: end.toISOString() }
      });
      setDateProblems(res.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch problems');
      setDateProblems([]);
    }
  };

  return (
    <div className="section">
      <h3>Activity Heatmap (Last 30 Days)</h3>
      <p>View your problem-solving activity from journal entries.</p>
      {error && <p className="error">{error}</p>}
      {activity.length ? (
        <div className="grid grid-template-columns-7 grid-gap-1">
          {activity.map(({ date, count }) => {
            const intensity = Math.min(count * 80, 100);
            return (
              <div
                key={date}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ backgroundColor: `rgba(75, 192, 192, ${intensity / 100 || 0.2})` }}
                title={`${date}: ${count} problems solved`}
                onClick={() => handleDateClick(date)}
              ></div>
            );
          })}
        </div>
      ) : (
        <p>No activity data available.</p>
      )}
      {selectedDate && (
        <div className="mt-4">
          <h4>Problems on {selectedDate}</h4>
          {dateProblems.length ? (
            <ul>
              {dateProblems.map(p => (
                <li key={p._id}>{p.problem} ({p.difficulty})</li>
              ))}
            </ul>
          ) : (
            <p>No problems solved on this date.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CalendarHeatmap;