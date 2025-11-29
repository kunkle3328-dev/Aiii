import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

// Fix for TypeScript not recognizing standard HTML/SVG elements in JSX.IntrinsicElements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: any;
      span: any;
      h1: any;
      h2: any;
      h3: any;
      p: any;
      main: any;
      button: any;
      input: any;
      textarea: any;
      select: any;
      option: any;
      optgroup: any;
      label: any;
      ul: any;
      li: any;
      a: any;
      canvas: any;
      svg: any;
      path: any;
      line: any;
      polyline: any;
      polygon: any;
      rect: any;
      circle: any;
    }
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <AppProvider>
            <App />
        </AppProvider>
    </React.StrictMode>
);