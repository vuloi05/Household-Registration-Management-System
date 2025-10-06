import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const FeaturesSection: React.FC = () => {
  useEffect(() => {
    // Intersection Observer for animations
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

    // Observe elements for scroll animations
    const featureCards = document.querySelectorAll('.feature-card') as NodeListOf<HTMLElement>;
    featureCards.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });

    // Enhanced hover effects for feature cards
    const handleMouseEnterFeature = (card: HTMLElement) => {
      const icon = card.querySelector('.feature-icon') as HTMLElement | null;
      if (icon) {
        icon.style.transform = 'scale(1.2) rotate(360deg)';
        icon.style.transition = 'transform 0.6s ease';
      }
    };
    const handleMouseLeaveFeature = (card: HTMLElement) => {
      const icon = card.querySelector('.feature-icon') as HTMLElement | null;
      if (icon) {
        icon.style.transform = '';
      }
    };
    featureCards.forEach((card) => {
      card.addEventListener('mouseenter', () => handleMouseEnterFeature(card));
      card.addEventListener('mouseleave', () => handleMouseLeaveFeature(card));
    });

    // Cleanup
    return () => {
      featureCards.forEach((el) => observer.unobserve(el));
      featureCards.forEach((card) => {
        card.removeEventListener('mouseenter', () => handleMouseEnterFeature(card));
        card.removeEventListener('mouseleave', () => handleMouseLeaveFeature(card));
      });
    };
  }, []);

  return (
    <section id="features" className="features">
      <div className="features-container">
        <div className="features-header">
          <h2 className="section-title">Tính năng vượt trội</h2>
          <p className="section-subtitle">Công nghệ tiên tiến cho quản lý hiệu quả</p>
        </div>
        <div className="features-grid">
          <div className="feature-card primary">
            <div className="feature-visual">
              <img
                alt="AI Analytics Dashboard"
                src="https://images.pexels.com/photos/27141316/pexels-photo-27141316.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              />
              <div className="feature-overlay">
                <div className="feature-icon">
                  <svg width="32" xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 24 24">
                    <path
                      d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="feature-content">
              <h3 className="feature-title">AI Phân tích</h3>
              <p className="feature-description">
                Trí tuệ nhân tạo phân tích dữ liệu nhân khẩu và dự báo xu hướng chính xác
              </p>
              <Link to="/ai-analytics" className="btn-link btn">
                <span>Tìm hiểu thêm</span>
                <svg width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24">
                  <path
                    d="M5 12h14m-7-7l7 7l-7 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
          <div className="secondary feature-card">
            <div className="feature-visual">
              <img
                alt="Secure Database"
                src="https://images.pexels.com/photos/32026177/pexels-photo-32026177.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              />
              <div className="feature-overlay">
                <div className="feature-icon">
                  <svg width="32" xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 24 24">
                    <path
                      d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Bảo mật tuyệt đối</h3>
              <p className="feature-description">
                Mã hóa AES-256 và blockchain bảo vệ dữ liệu cá nhân tuyệt đối
              </p>
              <Link to="/security" className="btn-link btn">
                <span>Chi tiết bảo mật</span>
                <svg width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24">
                  <path
                    d="M5 12h14m-7-7l7 7l-7 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
          <div className="feature-card tertiary">
            <div className="feature-visual">
              <img
                alt="Real-time Dashboard"
                src="https://images.pexels.com/photos/17345643/pexels-photo-17345643.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              />
              <div className="feature-overlay">
                <div className="feature-icon">
                  <svg width="32" xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                      <path d="m19 9l-5 5l-4-4l-3 3" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Thời gian thực</h3>
              <p className="feature-description">
                Cập nhật dữ liệu và thống kê theo thời gian thực với dashboard trực quan
              </p>
              <Link to="/dashboard" className="btn-link btn">
                <span>Xem demo</span>
                <svg width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24">
                  <path
                    d="M5 12h14m-7-7l7 7l-7 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
          <div className="quaternary feature-card">
            <div className="feature-visual">
              <img
                alt="Smart Management"
                src="https://images.pexels.com/photos/27141307/pexels-photo-27141307.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              />
              <div className="feature-overlay">
                <div className="feature-icon">
                  <svg width="32" xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
                      <path d="M3 12a9 3 0 0 0 18 0" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Quản lý thông minh</h3>
              <p className="feature-description">
                Tự động hóa quy trình và tối ưu hiệu quả công việc với AI
              </p>
              <Link to="/smart-management" className="btn-link btn">
                <span>Khám phá</span>
                <svg width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24">
                  <path
                    d="M5 12h14m-7-7l7 7l-7 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;