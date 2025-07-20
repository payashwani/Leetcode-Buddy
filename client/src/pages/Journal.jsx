import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MoodChart from '../components/MoodChart';
import '../styles/journal.css';

axios.defaults.baseURL = 'http://localhost:5000';

const generateSlug = (problem) => {
  return problem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const Journal = () => {
  const [problem, setProblem] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [mood, setMood] = useState('Easy');
  const [status, setStatus] = useState({
    Solved: false,
    'Needs Revision': false,
    "Couldn't Solve": false,
  });
  const [patterns, setPatterns] = useState('');
  const [notes, setNotes] = useState('');
  const [problems, setProblems] = useState([]);
  const [aiRecap, setAiRecap] = useState('');
  const [rowLanguages, setRowLanguages] = useState({});
  const [aiHelpResponse, setAiHelpResponse] = useState(null);
  const [showAiHelpPopup, setShowAiHelpPopup] = useState(false);
  const [showAiRecap, setShowAiRecap] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const handleStatusChange = (e) => {
    const { name, checked } = e.target;
    setStatus((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleRowLanguageChange = (problemId, language) => {
    setRowLanguages((prev) => ({
      ...prev,
      [problemId]: language,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!problem) {
      alert('Problem name is required.');
      return;
    }

    const slug = generateSlug(problem);
    const selectedStatuses = Object.keys(status).filter((key) => status[key]);

    if (selectedStatuses.length === 0) {
      alert('Please select at least one status.');
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        alert('Please log in to save problems.');
        return;
      }

      await axios.post(
        '/api/problems',
        {
          problem,
          slug,
          difficulty,
          mood,
          status: selectedStatuses,
          patterns: patterns.split(',').map((p) => p.trim()).filter(Boolean),
          notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Problem saved successfully!');
      fetchProblems();
      setProblem('');
      setDifficulty('Easy');
      setMood('Easy');
      setStatus({
        Solved: false,
        'Needs Revision': false,
        "Couldn't Solve": false,
      });
      setPatterns('');
      setNotes('');
    } catch (error) {
      console.error('Error saving problem:', error.response?.data || error.message);
      alert('Failed to save problem: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const fetchAIHelp = async (problemName, language) => {
    if (!problemName || !language) {
      alert('Problem name and language are required for AI help.');
      return;
    }

    const slug = generateSlug(problemName);

    try {
      const token = getToken();
      if (!token) {
        alert('Please log in to fetch AI help.');
        return;
      }

      const res = await axios.get(`/api/leetcode/ai-help?slug=${slug}&language=${language}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAiHelpResponse(res.data);
      setShowAiHelpPopup(true);
    } catch (err) {
      console.error('AI Help fetch error:', err.response?.data || err.message);
      alert('Failed to fetch AI help: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const closeAiHelpPopup = () => {
    setShowAiHelpPopup(false);
    setAiHelpResponse(null);
  };

  const fetchAIRecap = async () => {
    try {
      const token = getToken();
      if (!token) {
        alert('Please log in to fetch AI recap.');
        return;
      }

      const res = await axios.get('/api/problems/ai-recap', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAiRecap(res.data.recap);
      setShowAiRecap(true);
    } catch (err) {
      console.error('AI Recap fetch error:', err.response?.data || err.message);
      alert('Failed to fetch AI recap: ' + (err.response?.data?.message || 'Unknown error'));
      setAiRecap('Unable to generate recap due to server issues.');
    }
  };

  const deleteProblem = async (id) => {
    try {
      const token = getToken();
      if (!token) {
        alert('Please log in to delete problems.');
        return;
      }

      await axios.delete(`/api/problems/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        });
        alert('Problem deleted successfully!');
        fetchProblems();
      } catch (err) {
        console.error('Error deleting problem:', err.response?.data || err.message);
        alert('Failed to delete problem: ' + (err.response?.data?.message || 'Unknown error'));
      }
    };

    const fetchProblems = async () => {
      try {
        const token = getToken();
        if (!token) {
          console.warn('No token found, skipping fetch.');
          setProblems([]);
          return;
        }

        const res = await axios.get('/api/problems', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProblems(res.data);
      } catch (err) {
        console.error('Error fetching problems:', err.response?.data || err.message);
        setProblems([]);
      }
    };

    useEffect(() => {
      fetchProblems();
    }, []);

    return (
      <div className="journal-container">
        <main>
          <section className="journal-info">
            <h2>Problem Journal</h2>
            <p>Document your DSA problem-solving journey with detailed entries, AI-powered insights, and mood tracking. 📝</p>
          </section>
          <section className="input-section">
            <form className="journal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Problem Title</label>
                <input value={problem} onChange={(e) => setProblem(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mood 😊</label>
                <select value={mood} onChange={(e) => setMood(e.target.value)}>
                  <option>Easy</option>
                  <option>Moderate</option>
                  <option>Challenging</option>
                  <option>Frustrating</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <div className="checkbox-group inline">
                  <label>
                    <input
                      type="checkbox"
                      name="Solved"
                      checked={status.Solved}
                      onChange={handleStatusChange}
                    />
                    Solved
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="Needs Revision"
                      checked={status['Needs Revision']}
                      onChange={handleStatusChange}
                    />
                    Needs Revision
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="Couldn't Solve"
                      checked={status["Couldn't Solve"]}
                      onChange={handleStatusChange}
                    />
                    Couldn't Solve
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Pattern</label>
                <input
                  value={patterns}
                  onChange={(e) => setPatterns(e.target.value)}
                  placeholder="e.g. Two Pointers, Binary Search"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <button type="submit">Save</button>
            </form>
          </section>
          <section className="ai-recap-section">
            <button onClick={fetchAIRecap}>Generate AI Recap 🤖</button>
            {showAiRecap && aiRecap && (
              <div className="ai-recap-content">
                {aiRecap.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
                <button onClick={() => setShowAiRecap(false)}>Close</button>
              </div>
            )}
          </section>
          <section className="confidence-chart">
            <h3 className="chart-title">Confidence Chart</h3>
            <p className="chart-subtitle">Confidence vs. Difficulty Over Time</p>
            <div className="chart-placeholder">
              <MoodChart problems={problems} />
            </div>
            <div className="chart-explanation">
              <strong>What does this chart show?</strong>
              <div>
                This chart tracks your mood, difficulty, and confidence over time.<br />
                Green line: Mood (1 = Frustrating, 4 = Easy).<br />
                Blue line: Difficulty (1 = Easy, 3 = Hard).<br />
                Point colors: <span style={{ color: '#28a745' }}>Green</span> = High Confidence (mood ≥ difficulty), 
                <span style={{ color: '#ffc107' }}>Yellow</span> = Medium Confidence, 
                <span style={{ color: '#dc3545' }}>Red</span> = Low Confidence (mood  difficulty).<br />
                Hover for problem names; low confidence issues are noted.
              </div>
            </div>
          </section>
          <section className="problem-history">
            <h3>Problem History 📚</h3>
            {problems.length ? (
              <table className="journal-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Problem</th>
                    <th>Mood</th>
                    <th>Solved</th>
                    <th>Needs Revision</th>
                    <th>Couldn't Solve</th>
                    <th>Pattern</th>
                    <th>Difficulty</th>
                    <th>Notes</th>
                    <th>AI Help</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((prob, index) => (
                    <tr
                      key={prob._id}
                      className={
                        prob.status.includes('Solved')
                          ? 'bg-green-100'
                          : prob.status.includes('Needs Revision')
                          ? 'bg-yellow-100'
                          : prob.status.includes("Couldn't Solve")
                          ? 'bg-red-100'
                          : ''
                      }
                    >
                      <td className="center">{index + 1}</td>
                      <td>{prob.problem}</td>
                      <td>{prob.mood}</td>
                      <td className="center">
                        {prob.status.includes('Solved') ? (
                          <span className="status-tick">✓</span>
                        ) : (
                          <span className="status-cross">✗</span>
                        )}
                      </td>
                      <td className="center">
                        {prob.status.includes('Needs Revision') ? (
                          <span className="status-tick">✓</span>
                        ) : (
                          <span className="status-cross">✗</span>
                        )}
                      </td>
                      <td className="center">
                        {prob.status.includes("Couldn't Solve") ? (
                          <span className="status-tick">✓</span>
                        ) : (
                          <span className="status-cross">✗</span>
                        )}
                      </td>
                      <td>{prob.patterns.join(', ')}</td>
                      <td>{prob.difficulty}</td>
                      <td>{prob.notes}</td>
                      <td className="action-buttons">
                        <select
                          value={rowLanguages[prob._id] || 'JavaScript'}
                          onChange={(e) => handleRowLanguageChange(prob._id, e.target.value)}
                        >
                          <option>JavaScript</option>
                          <option>Python</option>
                          <option>Java</option>
                          <option>C++</option>
                        </select>
                        <button
                          className="ai-help-btn"
                          onClick={() => fetchAIHelp(prob.problem, rowLanguages[prob._id] || 'JavaScript')}
                        >
                          AI Help
                        </button>
                      </td>
                      <td className="center">
                        <button className="delete-btn" onClick={() => deleteProblem(prob._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="11" className="scroll-indicator">
                      ↓ Scroll for more
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p>No problems yet.</p>
            )}
          </section>
        </main>

        {showAiHelpPopup && aiHelpResponse && (
          <div className="ai-help-popup">
            <div className="ai-help-content">
              <h3>AI Help for {aiHelpResponse.problem || 'Problem'}</h3>
              <div className="ai-section">
                <h4>Code</h4>
                <pre>{aiHelpResponse.code || 'No code provided.'}</pre>
              </div>
              <div className="ai-section">
                <h4>Explanation</h4>
                <p>{aiHelpResponse.explanation || 'No explanation provided.'}</p>
              </div>
              <div className="ai-section">
                <h4>Pattern</h4>
                <p>{aiHelpResponse.pattern || 'No pattern identified.'}</p>
              </div>
              <div className="ai-section">
                <h4>Common Mistake</h4>
                <p>{aiHelpResponse.commonMistake || 'No common mistakes noted.'}</p>
              </div>
              <div className="ai-section">
                <h4>Motivation</h4>
                <p>{aiHelpResponse.motivation || 'Keep practicing!'}</p>
              </div>
              <button onClick={closeAiHelpPopup}>Close</button>
            </div>
          </div>
        )}
      </div>
    );
};

export default Journal;