import React from 'react';
import Navigation from '../components/Navigation';
import LoginSection from '../components/login/LoginSection';
import Header from '../components/login/Header';
import Footer from '../components/Footer';

const Login: React.FC = () => {
  return (
    <>
      <Navigation />
      <Header />
      <LoginSection />
      <div style={{ marginTop: '40px' }}>
        <Footer />
      </div>
    </>
  );
};

export default Login;