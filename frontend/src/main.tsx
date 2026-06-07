import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import { configureMonacoWorker } from './components/codeeditor-worker.ts';
import 'react-toastify/dist/ReactToastify.min.css';
import './index.css';

configureMonacoWorker();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}
ReactDOM.createRoot(rootElement).render(<App />);
