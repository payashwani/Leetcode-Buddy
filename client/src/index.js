import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';
import axios from 'axios'; // ✅ Import Axios

// ✅ Set default Axios base URL for all requests
axios.defaults.baseURL = 'https://leetcode-buddy-iota.vercel.app';

axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
// ✅ This will ensure that all Axios requests made in the app will use this base URL and include credentials (cookies) for authentication.
// ✅ You can change the base URL to your production server when deploying.
// ✅ This setup allows you to make API calls without needing to specify the full URL each time, simplifying your code and making it easier to maintain.
// ✅ Make sure to handle errors and responses properly in your components or services where you use Axios.
// ✅ This is a common practice in React applications to centralize API configuration and make it easier to manage API calls throughout the app.
// ✅ You can also create an Axios instance with custom configurations if needed, but for simplicity, we're using the default instance here.
// ✅ This setup is ready for development and can be easily adapted for production by changing the base URL.
// ✅ Remember to install Axios in your project if you haven't already:
// npm install axios
// ✅ This will ensure that Axios is available globally in your React application, allowing you to make HTTP requests easily.
// ✅ This code initializes the React application, sets up routing with React Router, and configures Axios for API requests.
// ✅ The global CSS file is imported to apply styles across the application.   