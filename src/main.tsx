import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ProductApp } from './product/ProductApp';
import './styles/tokens.css';
import './styles/phone.css';
import './styles/desktop.css';
import './styles/views.css';
import './styles/phase2.css';
import './styles/phase2-app.css';
import './styles/product.css';

const studio = new URLSearchParams(window.location.search).has('studio');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {studio ? <App /> : <ProductApp />}
  </React.StrictMode>,
);
