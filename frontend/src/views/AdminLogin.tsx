import React, { useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import '../styles/base.css';
import '../styles/variables.css';
import './Home.css';
import './NotFound.css';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.admin-section .anim') as NodeListOf<HTMLElement>;
    elements.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });

    // Ripple effect on admin page buttons (match Home behavior)
    const form = document.querySelector('.admin-form') as HTMLElement | null;
    const buttons = form ? (form.querySelectorAll('.btn') as NodeListOf<HTMLElement>) : ([] as unknown as NodeListOf<HTMLElement>);
    const handleButtonClick = (e: MouseEvent, button: HTMLElement) => {
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `;

      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    };
    buttons.forEach((button) => {
      button.addEventListener('click', (e: MouseEvent) => handleButtonClick(e, button));
    });

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      buttons.forEach((button) => {
        button.replaceWith(button.cloneNode(true) as HTMLElement);
      });
    };
  }, []);

  return (
    <div className="login-page">
      <Navigation />
      <div className="admin-section">
        <div className="admin-container">
          <div className="admin-header anim">
            <h2>Đăng nhập Quản trị</h2>
            <p>Tài khoản cấp bởi hệ thống dành cho Doanh nghiệp/Tổ chức</p>
          </div>
          <div className="admin-form-wrapper anim">
            <form className="admin-form">
              <div className="form-group">
                <label htmlFor="email">Mã ID</label>
                <input id="email" type="email" placeholder="123456" />
              </div>
              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input id="password" type="password" placeholder="••••••••" />
              </div>
              <button type="submit" className="btn btn-primary">Đăng nhập</button>
            </form>
          </div>
        </div>
        <div className="admin-footer anim">
          <Footer />
        </div>
      </div>
      
    </div>
  );
};

export default AdminLogin;


