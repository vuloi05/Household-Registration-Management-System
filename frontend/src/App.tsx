import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { store } from './store';
import AppRoutes from './routes';
import './styles/index.css';

dayjs.locale('vi');

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider locale={viVN}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  );
};

export default App;
