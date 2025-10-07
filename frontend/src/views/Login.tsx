import React from 'react';
import LoginSection from '../components/login/LoginSection';
import Header from '../components/login/Header';


import Footer from '../components/Footer';

const Login: React.FC = () => {
  return (
    <>
      <Header />
      <LoginSection />
      <div style={{ marginTop: '40px' }}>
        <Footer />
      </div>
    </>
  );
};

export default Login;