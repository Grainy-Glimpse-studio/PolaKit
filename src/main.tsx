import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Note: StrictMode removed to prevent p5.js duplicate canvas issue
createRoot(document.getElementById('root')!).render(<App />);
