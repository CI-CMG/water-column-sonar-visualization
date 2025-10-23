import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux';
import { store } from './app/store';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* Wrap the app in the store so that all pages can access it */}
        <Provider store={store}>
            <App />
        </Provider>
    </StrictMode>,
)
