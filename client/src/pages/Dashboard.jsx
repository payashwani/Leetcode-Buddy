import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../styles/dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [topicStats, setTopicStats] = useState([]);
  const [strengthWeaknessData, setStrengthWeaknessData] = useState([]);
  const [streakData, setStreakData] = useState([]);
  const [longestStreak, setLongestStreak] = useState(0);
  const [calendarMarks, setCalendarMarks] = useState(() => {
    const savedMarks = localStorage.getItem('calendarMarks');
    return savedMarks ? JSON.parse(savedMarks) : {};
  });
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    localStorage.setItem('calendarMarks', JSON.stringify(calendarMarks));
  }, [calendarMarks]);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('Please log in');
        navigate('/login');
        return;
      }
      try {
        const problemsRes = await axios.get('/api/problems', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        console.log('Problems Response:', problemsRes.data);
        if (!Array.isArray(problemsRes.data)) {
          console.error('Problems data is not an array:', problemsRes.data);
          setTopicStats([]);
          setStrengthWeaknessData([]);
          setStreakData([]);
          setError('Invalid data format');
          return;
        }
        problemsRes.data.forEach(prob => {
          console.log(`Problem ${prob._id}:`, { 
            problem: prob.problem, 
            patterns: prob.patterns, 
            status: prob.status, 
            difficulty: prob.difficulty, 
            mood: prob.mood, 
            createdAt: prob.createdAt 
          });
        });

        // Topic Analysis: Problems solved per topic
        const topicStatsMap = problemsRes.data.reduce((acc, prob) => {
          const patterns = Array.isArray(prob.patterns) ? prob.patterns.filter(topic => topic && typeof topic === 'string') : [];
          if (Array.isArray(prob.status) && prob.status.includes('Solved')) {
            patterns.forEach(topic => {
              acc[topic] = acc[topic] || { topic, solved: 0 };
              acc[topic].solved += 1;
            });
          }
          return acc;
        }, {});
        const stats = Object.values(topicStatsMap);
        setTopicStats(stats);

        // Strength & Weakness: Based on difficulty, solve count, patterns, and mood
        const strengthWeaknessMap = problemsRes.data.reduce((acc, prob) => {
          const patterns = Array.isArray(prob.patterns) ? prob.patterns.filter(topic => topic && typeof topic === 'string') : [];
          const isSolved = Array.isArray(prob.status) && prob.status.includes('Solved');
          const difficulty = prob.difficulty || 'Unknown';
          const mood = prob.mood || 'Unknown';
          patterns.forEach(topic => {
            acc[topic] = acc[topic] || { topic, solved: 0, strengthCount: 0, weaknessCount: 0 };
            if (isSolved) {
              acc[topic].solved += 1;
              if (difficulty === 'Hard' && (mood === 'Easy' || mood === 'Moderate')) {
                acc[topic].strengthCount += 1;
              } else if (mood === 'Challenging' || mood === 'Frustrating' || acc[topic].solved <= 1) {
                acc[topic].weaknessCount += 1;
              }
            } else {
              acc[topic].weaknessCount += 1; // Unsolved problems contribute to weakness
            }
          });
          return acc;
        }, {});
        const strengthWeakness = Object.values(strengthWeaknessMap).map(item => ({
          topic: item.topic,
          solved: item.solved,
          strength: item.strengthCount,
          weakness: item.weaknessCount
        }));
        setStrengthWeaknessData(strengthWeakness);

        // Streak Data
        const today = new Date(); // real current date
        const year = today.getFullYear();
        const month = today.getMonth(); // 0-based index

        const numDaysInMonth = new Date(year, month + 1, 0).getDate(); // last day of current month

        const days = Array.from({ length: numDaysInMonth }, (_, i) => {
          const date = new Date(year, month, i + 1);
          return date.toISOString().split('T')[0];
        });

        const problemDays = problemsRes.data.reduce((acc, prob) => {
          const date = new Date(prob.createdAt).toISOString().split('T')[0];
          acc[date] = prob.status || [];
          return acc;
        }, {});
        const initialStreakData = days.map(date => {
          const day = new Date(date).getDay();
          const statuses = problemDays[date] || [];
          return { date, type: calendarMarks[date] || (statuses.includes('Solved') ? 'solved' : statuses.includes('Needs Revision') ? 'revision' : 'skipped'), day };
        });

        let currentStreak = 0;
        let maxStreak = 0;
        initialStreakData.forEach(day => {
          if (day.type === 'solved') currentStreak++;
          else currentStreak = 0;
          maxStreak = Math.max(maxStreak, currentStreak);
        });
        setStreakData(initialStreakData);
        setLongestStreak(maxStreak);
      } catch (err) {
        console.error('Problems Fetch Error:', err.response?.status, err.response?.data);
        setError(err.response?.data?.message || 'Failed to load problems');
        setTopicStats([]);
        setStrengthWeaknessData([]);
        setStreakData([]);
        setLongestStreak(0);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchData();
  }, [navigate, token, calendarMarks]);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleMarkDay = (date, status) => {
    setCalendarMarks(prev => {
      const newMarks = { ...prev, [date]: status };
      return newMarks;
    });
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo.trim(), completed: false }]);
      setNewTodo('');
    }
  };

  const handleToggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Updated to use current date for dynamic month/year
  const currentMonthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="dashboard">
      <header className="header">
        <h1 className="header-title">Coding Dashboard</h1>
        <div className="header-profile">👤</div>
      </header>
      <main className="main-content">
        <div className="section todo">
          <h3>To-Do List</h3>
          <p>Manage your daily tasks. Add, complete, or delete tasks as needed.</p>
          <form onSubmit={handleAddTodo} className="todo-form">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task"
              className="todo-input"
            />
            <button type="submit" className="todo-btn">Add</button>
          </form>
          {error && <p className="error">{error}</p>}
          {todos.length ? (
            <ul className="todo-list">
              {todos.map(todo => (
                <li key={todo.id} className="todo-item">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id)}
                    className="todo-checkbox"
                  />
                  <span className={todo.completed ? 'todo-text completed' : 'todo-text'}>
                    {todo.text}
                  </span>
                  <button onClick={() => handleDeleteTodo(todo.id)} className="todo-delete">Delete</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No tasks added yet.</p>
          )}
        </div>
        <div className="charts-container">
          <div className="section topic-analysis">
            <h3>Topic Analysis</h3>
            <p>Bar chart showing problems solved per topic from your journal.</p>
            {error && <p className="error">{error}</p>}
            {topicStats.length ? (
              <div className="chart-container">
                <Bar
                  data={{
                    labels: topicStats.map(stat => stat.topic),
                    datasets: [{
                      label: 'Problems Solved',
                      data: topicStats.map(stat => stat.solved),
                      backgroundColor: 'rgba(40, 167, 69, 0.7)', // Vibrant green
                      borderColor: 'rgba(40, 167, 69, 1)',
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: { display: true, text: 'Problems Solved by Topic', color: '#333333', font: { size: 12 } },
                      legend: { labels: { color: '#333333', font: { size: 10 } } },
                      tooltip: { backgroundColor: '#ADD8E6', titleColor: '#333333', bodyColor: '#333333', borderColor: '#28a745', borderWidth: 1, font: { size: 10 } }
                    },
                    scales: {
                      x: { ticks: { color: '#333333', font: { size: 10 } }, grid: { color: '#E5E7EB' } },
                      y: { beginAtZero: true, ticks: { color: '#333333', stepSize: 1, font: { size: 10 } }, grid: { color: '#E5E7EB' } }
                    }
                  }}
                />
              </div>
            ) : (
              <p>No solved problems with patterns found. Add problems with patterns in the journal.</p>
            )}
          </div>
          <div className="section proficiency">
            <h3>Strength & Weakness Chart</h3>
            {strengthWeaknessData.length ? (
              <div className="strength-weakness-chart">
                <Bar
                  data={{
                    labels: strengthWeaknessData.map(item => item.topic),
                    datasets: [
                      {
                        label: 'Strength (Hard, Easy/Moderate mood)',
                        data: strengthWeaknessData.map(item => item.strength),
                        backgroundColor: 'rgba(40, 167, 69, 0.7)', // Vibrant green
                        borderColor: 'rgba(40, 167, 69, 1)',
                        borderWidth: 1
                      },
                      {
                        label: 'Weakness (Low solves or Challenging/Frustrating)',
                        data: strengthWeaknessData.map(item => item.weakness),
                        backgroundColor: 'rgba(220, 53, 69, 0.7)', // Vivid red
                        borderColor: 'rgba(220, 53, 69, 1)',
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: { display: true, text: 'Strength & Weakness by Topic', color: '#333333', font: { size: 12 } },
                      legend: { labels: { color: '#333333', font: { size: 10 } } },
                      tooltip: { backgroundColor: '#ADD8E6', titleColor: '#333333', bodyColor: '#333333', borderColor: '#28a745', borderWidth: 1, font: { size: 10 } }
                    },
                    scales: {
                      x: { ticks: { color: '#333333', font: { size: 10 } }, grid: { color: '#E5E7EB' } },
                      y: { beginAtZero: true, ticks: { color: '#333333', stepSize: 1, font: { size: 10 } }, grid: { color: '#E5E7EB' } }
                    }
                  }}
                />
              </div>
            ) : (
              <p>No data available for Strength & Weakness Chart. Add problems with patterns, difficulty, and mood in the journal.</p>
            )}
            <div className="strength-weakness-text">
              <p>STRENGTH - {strengthWeaknessData.filter(item => item.strength > 0).map(item => item.topic).join(', ') || 'none yet'}</p>
              <p>WEAKNESS - {strengthWeaknessData.filter(item => item.weakness > 0 || item.solved <= 1).map(item => item.topic).join(', ') || 'none yet'}</p>
            </div>
          </div>
        </div>
        <div className="section calendar">
          <h3>DSA Streak Calendar</h3>
          <p className="text-sm text-brown-800 mb-2">
            MARK YOUR PROGRESS : S - Solved, R - Revision, NS - Not Solved (default)
          </p>
          {error && <p className="error">{error}</p>}
          <div className="calendar-grid grid grid-cols-7 gap-3 bg-beige-100 p-6 rounded-lg">
            <div className="calendar-month col-span-7 text-center text-xl font-semibold text-brown-800 mb-4">
              {currentMonthYear}
            </div>
            <div className="calendar-header grid grid-cols-7 gap-3">
              {daysOfWeek.map(day => (
                <div key={day} className="calendar-day-header text-center text-sm font-semibold text-brown-800">
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>
            {streakData.map((day, index) => (
              <div key={index} className="calendar-day-container flex flex-col items-center gap-2">
                <div
                  className={`calendar-day w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium
                    ${calendarMarks[day.date] === 'solved' ? 'bg-solved text-white' : 
                      calendarMarks[day.date] === 'revision' ? 'bg-yellow-500 text-brown-800' : 
                      'bg-not-solved text-white'}`}
                  title={`${day.date} - ${calendarMarks[day.date] === 'solved' ? 'Solved' : calendarMarks[day.date] === 'revision' ? 'Revision' : 'Not Solved'}`}
                >
                  {new Date(day.date).getDate()}
                </div>
                <select
                  className="mark-select text-xs p-1 rounded bg-white text-brown-800 border border-beige-300"
                  value={calendarMarks[day.date] || 'skipped'}
                  onChange={(e) => handleMarkDay(day.date, e.target.value)}
                >
                  <option value="solved">S</option>
                  <option value="revision">R</option>
                  <option value="skipped">NS</option>
                </select>
              </div>
            ))}
          </div>
          <p className="text-sm text-brown-800 mt-2">Longest Streak: {longestStreak} days <span role="img" aria-label="fire">🔥</span></p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;