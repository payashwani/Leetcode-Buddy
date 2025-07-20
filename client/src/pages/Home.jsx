import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import heroImg from '../leetcode-buddy-pdf-assets/hero-dashboard.jpg';
import whyImg from '../leetcode-buddy-pdf-assets/why-coding.jpg';
import aiBrainImg from '../leetcode-buddy-pdf-assets/ai-brain.jpg';
import companyPrepImg from '../leetcode-buddy-pdf-assets/company-logos.jpg';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Homepage() {
  const token = localStorage.getItem('token');

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url(${heroImg})` }}></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>
            Master DSA with LeetCode Buddy.
          </h1>
          <p>
            LeetCode is no longer a fear -- conquer Data Structures and Algorithms smartly.<br />
            Solve efficiently, learn from every attempt, and target what matters most.<br />
            With LeetCode Buddy, practice becomes confidence and confidence wins interviews.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="button primary">Sign Up Today</Link>
            <Link to="/learn-more" className="button secondary">Discover More ↓</Link>
          </div>
        </div>
      </section>

{/* Why LeetCode Buddy Section */}
<section className="section why-leetcode">
  <div className="section-header">
    <h2>Why LeetCode Buddy?</h2>
    <p>
      In today’s competitive tech landscape, mastering Data Structures and Algorithms (DSA) is crucial for landing your dream job. 
      LeetCode Buddy transforms your interview preparation, offering a structured, personalized, and insightful approach to tracking 
      progress and identifying areas for improvement. Stop guessing, start succeeding!
    </p>
  </div>

  <div className="why-layout">
    <div className="media-col">
      <img src={whyImg} alt="Why LeetCode Buddy" className="section-image" />
    </div>

    <div className="text-col">
      <h3 className="section-subhead">Conquer DSA with Confidence</h3>
      <p>
        Traditional preparation can be overwhelming. LeetCode Buddy cuts through the noise, providing clear pathways and actionable insights. 
        Whether you're a beginner or refining advanced techniques, our platform adapts to your pace and needs.
      </p>
      <ul className="features-list">
        <li>Personalized learning tailored to your strengths and weaknesses.</li>
        <li>Efficient progress tracking, so you always know where you stand.</li>
        <li>Strategic preparation for top-tier company interviews.</li>
      </ul>
    </div>
  </div>
</section>

<section className="journal-section">
  <div className="section-content">
    <h2 className="journal-heading">Feature Spotlight: Your Personal LeetCode Journal</h2>
    <p className="journal-subtext">
      Never forget a key insight or a tricky edge case again. The LeetCode Journal is designed to be your comprehensive problem-solving log, capturing every detail of your practice sessions. Elevate your learning by reflecting on each problem.
    </p>

    <div className="feature-grid">
      <div className="feature-box">
        <div className="feature-icon">📓</div>
        <h4>Log Every Problem</h4>
        <p>
          Record the problem title, its difficulty, and the date you attempted it. Keep a detailed history of your journey.
        </p>
      </div>

      <div className="feature-box">
        <div className="feature-icon">😊</div>
        <h4>Track Your Mood</h4>
        <p>
          How did you feel solving it? Frustrated, triumphant, or enlightened? Understanding your emotional state helps identify patterns in your learning.
        </p>
      </div>

      <div className="feature-box">
        <div className="feature-icon">📝</div>
        <h4>Detailed Notes & Solutions</h4>
        <p>
          Jot down critical thought processes, alternative approaches, and the optimal solution. Include code snippets and explanations.
        </p>
      </div>

      <div className="feature-box">
        <div className="feature-icon">🏷️</div>
        <h4>Tag & Organize</h4>
        <p>
          Categorize problems by topic (e.g., dynamic programming, graph theory) or company (e.g., Google, Meta) for easy retrieval.
        </p>
      </div>
    </div>
  </div>
</section>


      {/* AI-Powered Roadmap Section */}
      <section className="section roadmap alt">
        <div className="section-content two-col reverse">
          <div className="media-col">
            <img src={aiBrainImg} alt="AI-Powered Roadmap" className="section-image" />
          </div>
          <div className="text-col">
            <h2>AI-Powered Roadmap: Your Tailored DSA Journey</h2>
            <p>Tired of generic study plans? Our intelligent AI roadmap dynamically crafts a learning path specifically for you. Based on your journal entries and performance, it pinpoints your weak areas and recommends the most impactful topics and problems to tackle next.</p>
            <div className="section-button">
              <Link to="/roadmap" className="button secondary">Explore Your AI Roadmap</Link>
            </div>
          </div>
        </div>
      </section>

{/* Dashboard Section (5th section) */}
<section className="section dashboard">
  <div className="section-content narrow left">
    <h2 className="dashboard-heading">Visualize Your Progress: The Intuitive Dashboard</h2>
    <p className="dashboard-text">
      See your hard work pay off with our comprehensive dashboard. Gain a clear overview of your progress,
      identify trends, and stay motivated with visual data. Track solved problems, performance by topic,
      and much more.
    </p>

    <div className="chart-wrapper">
      <Bar
        data={{
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          datasets: [
            {
              label: 'Problems Solved',
              data: [5, 8, 12, 7, 10, 15],
              backgroundColor: 'rgba(14, 166, 77, 0.8)', // fresh green
              borderRadius: 10,
              barThickness: 40,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 5 },
              grid: {
                color: 'rgba(0,0,0,0.05)',
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        }}
      />
    </div>

    <p className="dashboard-foot">
      Our dashboard isn't just about numbers; it's about telling the story of your growth.
      Visualizations help you spot patterns, understand your consistency, and celebrate milestones,
      keeping you engaged and on track.
    </p>
  </div>
</section>

 <section className="progress-section">
      <h2 className="progress-title">📈 Why Track Your Progress in DSA?</h2>
      <p className="progress-intro">
        Your DSA journey isn't just about the destination — it's about growing through every challenge. Here's why progress tracking matters:
      </p>

      <div className="progress-grid">
        <div className="progress-box one">
          <h3>🧠 Identify Weaknesses</h3>
          <p>Spot tricky topics early and focus your energy where it counts most.</p>
        </div>

        <div className="progress-box two">
          <h3>📊 Measure Growth</h3>
          <p>See how far you’ve come over time. Small wins = big confidence!</p>
        </div>

        <div className="progress-box three">
          <h3>📅 Stay Consistent</h3>
          <p>Tracking builds routine. Routine builds results. Simple.</p>
        </div>

        <div className="progress-box four">
          <h3>⚙️ Optimize Strategy</h3>
          <p>Work smart, not just hard — refine your prep using real data.</p>
        </div>
      </div>
    </section>

{/* Company Interviews Section */}
<section className="company-prep">
  <div className="company-container">
    <h2 className="company-title">💼 Prepare for Company Interviews with Confidence</h2>

    <div className="company-content">
      <div className="company-left">
        <img src={companyPrepImg} alt="Company Interview Prep" className="company-img" />
      </div>
      <div className="company-right">
        <p>
          Beyond just solving LeetCode problems, <strong>LeetCode Buddy</strong> helps you strategize for specific company interviews.
          Our platform integrates insights on common interview patterns and essential DSA topics frequently asked by leading tech companies.
        </p>
        <p>
          Whether you're aiming for <strong>FAANG</strong> or a rising startup, our tools help you focus your efforts where they'll have the most impact.
          Practice problems are tagged by companies that typically ask them, giving you a competitive edge.
        </p>

        <ul className="company-bullets">
          <li>✅ <span>Curated problem sets based on real interview patterns.</span></li>
          <li>🔍 <span>Insights into company-specific hiring processes.</span></li>
          <li>🧠 <span>Mock interview simulations to perfect your preparation.</span></li>
        </ul>

        <Link to="/company-prep" className="company-button">
          View Company-Specific Prep
        </Link>
      </div>
    </div>
  </div>
</section>


      {/* Final CTA Section */}
      <section className="section cta">
        <div className="section-content narrow center">
          <h2>Ready to Transform Your Interview Prep?</h2>
          <p>Join thousands of engineers who are acing their technical interviews with LeetCode Buddy. Sign up today and unlock your full potential!</p>
          <div className="cta-buttons">
            {!token && (
              <>
                <Link to="/signup" className="button primary">Sign Up for Free</Link>
                <Link to="/login" className="button secondary">Log In</Link>
              </>
            )}
            {token && (
              <Link to="/Signup" className="button primary">Signup Today and start your journey!</Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Homepage;