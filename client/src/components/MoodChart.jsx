import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const MoodChart = ({ problems }) => {
  const moodScores = { Easy: 4, Moderate: 3, Challenging: 2, Frustrating: 1 };
  const difficultyScores = { Easy: 1, Medium: 2, Hard: 3 };

  // Normalize casing and filter valid data
  const validProblems = problems
    .filter((p) => p.createdAt && p.mood && p.difficulty && p.status && p.problem)
    .map((p) => ({
      ...p,
      mood: p.mood.charAt(0).toUpperCase() + p.mood.slice(1).toLowerCase(),
      difficulty: p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1).toLowerCase(),
    }))
    .filter(
      (p) =>
        moodScores[p.mood] &&
        difficultyScores[p.difficulty] &&
        typeof p.createdAt === 'string' &&
        !isNaN(new Date(p.createdAt).getTime())
    );

  if (!validProblems.length) {
    return (
      <div className="mood-chart">
        <p className="error">No valid data available for chart. Add problems with mood, difficulty, and name.</p>
      </div>
    );
  }

  const labels = validProblems.map((p) =>
    new Date(p.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  );

  const moodData = validProblems.map((p) => moodScores[p.mood]);
  const difficultyData = validProblems.map((p) => difficultyScores[p.difficulty]);

  // Determine confidence and colors based on mood vs. difficulty
  const confidenceColors = validProblems.map((p) => {
    const moodScore = moodScores[p.mood];
    const diffScore = difficultyScores[p.difficulty];
    return moodScore >= diffScore ? '#28a745' : (Math.abs(moodScore - diffScore) <= 1 ? '#ffc107' : '#dc3545');
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Mood (Confidence)',
        data: moodData,
        borderColor: '#28a745',
        backgroundColor: validProblems.map((p, i) => confidenceColors[i] + '40'), // 40% opacity
        fill: true,
        yAxisID: 'yMood',
        pointBackgroundColor: confidenceColors,
        pointBorderColor: confidenceColors,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Difficulty',
        data: difficultyData,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        fill: false,
        yAxisID: 'yDifficulty',
        pointBackgroundColor: '#007bff',
        pointBorderColor: '#007bff',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2.0,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12 } } },
      title: {
        display: true,
        text: 'Confidence vs. Difficulty Over Time',
        font: { size: 14, weight: '600' },
        padding: { top: 10, bottom: 10 },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const problem = validProblems[context.dataIndex];
            const confidence = moodScores[problem.mood] >= difficultyScores[problem.difficulty] ? 'High' :
              Math.abs(moodScores[problem.mood] - difficultyScores[problem.difficulty]) <= 1 ? 'Medium' : 'Low';
            return [
              `${context.dataset.label}: ${context.raw} (${problem.mood})`,
              `Difficulty: ${difficultyScores[problem.difficulty]} (${problem.difficulty})`,
              `Confidence: ${confidence}`,
              `Problem: ${problem.problem}`,
              confidence === 'Low' ? 'Note: Low confidence issue!' : '',
            ];
          },
        },
      },
    },
    scales: {
      yMood: {
        type: 'linear',
        position: 'left',
        min: 0.5,
        max: 4.5,
        title: { display: true, text: 'Mood (1-4)', font: { size: 10 } },
        ticks: {
          stepSize: 1,
          callback: (value) => Object.keys(moodScores).find((k) => moodScores[k] === value) || '',
          font: { size: 9 },
        },
      },
      yDifficulty: {
        type: 'linear',
        position: 'right',
        min: 0.5,
        max: 3.5,
        title: { display: true, text: 'Difficulty (1-3)', font: { size: 10 } },
        grid: { drawOnChartArea: false },
        ticks: {
          stepSize: 1,
          callback: (value) => Object.keys(difficultyScores).find((k) => difficultyScores[k] === value) || '',
          font: { size: 9 },
        },
      },
      x: {
        title: { display: true, text: 'Date', font: { size: 10 } },
        ticks: { font: { size: 9 }, maxRotation: 0, minRotation: 0 },
      },
    },
  };

  return (
    <div className="mood-chart" style={{ height: '250px', width: '90%', maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default MoodChart;