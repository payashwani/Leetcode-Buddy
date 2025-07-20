import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/monthlyGoals.css';

const MonthlyGoals = () => {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [problemCount, setProblemCount] = useState('');
  const [dailyTime, setDailyTime] = useState('');
  const [learningStyle, setLearningStyle] = useState('');
  const [missedGoalReason, setMissedGoalReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchGoals();
  }, [token, navigate]);

  const fetchGoals = async () => {
    try {
      const res = await axios.get('/api/goals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched goals:', res.data);
      setGoals(res.data);
    } catch (err) {
      console.error('Fetch goals error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      } else {
        setError(err.response?.data?.message || 'Failed to fetch goals');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(
        '/api/goals',
        { title, targetDate, problemCount: Number(problemCount), dailyTime: Number(dailyTime), learningStyle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Created goal response:', res.data.goal);
      if (!goals.some(g => g._id === res.data.goal._id)) {
        setGoals([...goals, res.data.goal]);
      }
      setTitle('');
      setTargetDate('');
      setProblemCount('');
      setDailyTime('');
      setLearningStyle('');
      setSuccess('Goal created with AI-powered roadmap!');
    } catch (err) {
      console.error('Create goal error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      } else {
        setError(err.response?.data?.message || 'Failed to create goal');
      }
    }
  };

  const handleUpdateProgress = async (id, progress) => {
    try {
      const res = await axios.put(
        `/api/goals/${id}`,
        { progress: Number(progress), missedGoalReason: progress < 100 ? missedGoalReason : '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGoals(goals.map(goal => goal._id === id ? res.data.goal : goal));
      setMissedGoalReason('');
      setSuccess('Progress updated!');
    } catch (err) {
      console.error('Update progress error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      } else {
        setError(err.response?.data?.message || 'Failed to update progress');
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(goals.filter(goal => goal._id !== id));
      setSuccess('Goal deleted!');
    } catch (err) {
      console.error('Delete goal error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      } else {
        setError(err.response?.data?.message || 'Failed to delete goal');
      }
    }
  };

  const parseTask = (task) => {
    task = task.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').trim();
    const dayMatch = task.match(/^(Day \d+(?:-\d+)?):(.+)/);
    if (dayMatch) {
      return { prefix: dayMatch[1], content: dayMatch[2].trim() };
    }
    return { prefix: '', content: task };
  };

  return (
    <div className="goals-container">
      <div className="entry-container">
        <h2>AI-Powered Monthly Goals</h2>
        <p>Create a goal and get a personalized learning roadmap powered by AI! Enter multiple topics (e.g., "Master Linked List, Graph, Array") to get numbered roadmaps with daily tasks.</p>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form className="goals-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Goal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Master Linked List, Graph, Array"
              required
            />
          </div>
          <div className="form-group">
            <label>Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="form-group">
            <label>Total Number of Problems</label>
            <input
              type="number"
              value={problemCount}
              onChange={(e) => setProblemCount(e.target.value)}
              placeholder="e.g., 100"
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Daily Time Commitment (minutes)</label>
            <input
              type="number"
              value={dailyTime}
              onChange={(e) => setDailyTime(e.target.value)}
              placeholder="e.g., 60"
              min="10"
              required
            />
          </div>
          <div className="form-group">
            <label>Learning Style</label>
            <select
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
              required
            >
              <option value="">Select your style</option>
              <option value="Visual">Visual (diagrams, visuals)</option>
              <option value="Code-first">Code-first (hands-on coding)</option>
              <option value="Video">Video (tutorials, explanations)</option>
            </select>
          </div>
        </form>
      </div>
      <div className="button-container">
        <button type="submit" className="custom-btn" onClick={handleSubmit}>Generate AI Roadmap</button>
      </div>
      <div className="roadmap-container">
        <div className="goals-list">
          <h3>Your Monthly Goals</h3>
          {goals.length === 0 ? (
            <p>No goals set yet. Start by creating one above!</p>
          ) : (
            goals.map(goal => (
              <div key={goal._id} className="goal-card">
                <h4>{goal.title}</h4>
                <p><strong>Target Date:</strong> {new Date(goal.targetDate).toLocaleDateString()}</p>
                <p><strong>Total Problems:</strong> {goal.problemCount}</p>
                <p><strong>Daily Time:</strong> {goal.dailyTime} min</p>
                <p><strong>Learning Style:</strong> {goal.learningStyle}</p>
                <div className="roadmap-workflow">
                  <h5>AI-Powered Roadmap</h5>
                  {console.log('Rendering goal:', goal._id, 'Topics:', goal.topics)}
                  {!goal.topics || goal.topics.length === 0 ? (
                    <p>No roadmap available. Please recreate the goal.</p>
                  ) : (
                    goal.topics.map((topic, index) => (
                      <div key={index} className="topic-roadmap">
                        <h6>{index + 1}. {topic.name}</h6>
                        {topic.roadmap && topic.roadmap.split('. ').filter(task => task.trim()).map((task, i, tasks) => {
                          const { prefix, content } = parseTask(task);
                          return (
                            <React.Fragment key={i}>
                              <div className="roadmap-step">
                                {prefix && <span className="task-prefix">{prefix}: </span>}
                                {content}
                              </div>
                              {i < tasks.length - 1 && <div className="arrow">↓</div>}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
                <div className="progress-section">
                  <p><strong>Progress:</strong> <span className="progress-tooltip">(Mark your daily progress as a percentage based on completed tasks or problems)</span></p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${goal.progress}%` }}></div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={goal.progress}
                    onBlur={(e) => handleUpdateProgress(goal._id, e.target.value)}
                    style={{ width: '60px', marginTop: '10px' }}
                  />
                  {goal.progress < 100 && (
                    <div className="form-group">
                      <label>Why missed?</label>
                      <input
                        type="text"
                        value={missedGoalReason}
                        onChange={(e) => setMissedGoalReason(e.target.value)}
                        onBlur={() => handleUpdateProgress(goal._id, goal.progress)}
                        placeholder="e.g., Too busy"
                      />
                    </div>
                  )}
                  <p><strong>Missed Reason:</strong> {goal.missedGoalReason || '-'}</p>
                </div>
                <button onClick={() => handleDelete(goal._id)} className="custom-btn">Delete Goal</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyGoals;