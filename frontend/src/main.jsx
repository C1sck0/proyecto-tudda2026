import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify';
import { ApiProvider } from './services/useApi';
import { GlobalProvider } from './services/useGlobal';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApiProvider>
      <GlobalProvider>
        <ToastContainer
          position="bottom-left"
          theme="dark"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <App />
      </GlobalProvider>
    </ApiProvider>
  </StrictMode>,
)
