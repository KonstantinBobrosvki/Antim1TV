import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from "react-router-dom";
import App from './components/app/App';
import { setupStore } from './store/store';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_HOST +'/api' ;

const store = setupStore()

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
