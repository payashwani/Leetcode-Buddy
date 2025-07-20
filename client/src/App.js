import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Journal from './pages/Journal';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MonthlyGoals from './pages/MonthlyGoals';
import Account from './pages/Account';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import Footer from './pages/Footer'; // ✅ import footer
import './styles/global.css';

function App() {
  const token = localStorage.getItem('token');
  return (
    <div>
      {token && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/journal" element={token ? <Journal /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/goals" element={token ? <MonthlyGoals /> : <Navigate to="/login" />} />
        <Route path="/account" element={token ? <Account /> : <Navigate to="/login" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPasswordConfirm />} />
      </Routes>
      <Footer /> {/* This makes it appear on every page */}
    </div>
  );
}

export default App;