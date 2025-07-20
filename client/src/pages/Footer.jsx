// client/src/pages/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/footer.css';


const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-links mb-2">
        <Link to="/privacy-policy" className="mr-4 hover:underline">Privacy Policy</Link>
        <Link to="/terms-of-service" className="hover:underline">Terms of Service</Link>
      </div>
      <div>© {new Date().getFullYear()} <strong>Payashwani Chaturvedi</strong>. All rights reserved.</div>
    </div>
  </footer>
);

export default Footer;
