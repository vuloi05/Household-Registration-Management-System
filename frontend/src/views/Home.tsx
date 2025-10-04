import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import './Home.css';

const Home: React.FC = () => {
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
    const elementsToAnimate = document.querySelectorAll('.feature-card, .access-card') as NodeListOf<HTMLElement>;
    elementsToAnimate.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });

    // Enhanced hover effects for feature cards
    const featureCards = document.querySelectorAll('.feature-card') as NodeListOf<HTMLElement>;
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

    // Access card glow effects
    const accessCards = document.querySelectorAll('.access-card') as NodeListOf<HTMLElement>;
    const handleMouseEnterAccess = (card: HTMLElement) => {
      const icon = card.querySelector('.access-icon') as HTMLElement | null;
      if (icon) {
        icon.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.6), 0 0 60px rgba(0, 255, 255, 0.4)';
        icon.style.transform = 'scale(1.1)';
      }
    };
    const handleMouseLeaveAccess = (card: HTMLElement) => {
      const icon = card.querySelector('.access-icon') as HTMLElement | null;
      if (icon) {
        icon.style.boxShadow = '';
        icon.style.transform = '';
      }
    };
    accessCards.forEach((card) => {
      card.addEventListener('mouseenter', () => handleMouseEnterAccess(card));
      card.addEventListener('mouseleave', () => handleMouseLeaveAccess(card));
    });

    // Button click effects
    const buttons = document.querySelectorAll('.btn') as NodeListOf<HTMLElement>;
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

    // Cleanup
    return () => {
      elementsToAnimate.forEach((el) => observer.unobserve(el));
      featureCards.forEach((card) => {
        card.removeEventListener('mouseenter', () => handleMouseEnterFeature(card));
        card.removeEventListener('mouseleave', () => handleMouseLeaveFeature(card));
      });
      accessCards.forEach((card) => {
        card.removeEventListener('mouseenter', () => handleMouseEnterAccess(card));
        card.removeEventListener('mouseleave', () => handleMouseLeaveAccess(card));
      });
      buttons.forEach((button) => {
        button.removeEventListener('click', (e: MouseEvent) => handleButtonClick(e, button));
      });
    };
  }, []);

  return (
    <div className="home-container1">
      <Helmet>
        <title>InfoFuturist - Quản lý tương lai</title>
        <meta property="og:title" content="InfoFuturist - Quản lý tương lai" />
      </Helmet>
      <Navigation />
      <main className="homepage">
        <HeroSection />
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
        <section id="access" className="access-points">
          <div className="access-container">
            <div className="access-header">
              <h2 className="section-title">Truy cập nhanh</h2>
              <p className="section-subtitle">Chọn chức năng phù hợp với nhu cầu của bạn</p>
            </div>
            <div className="access-grid">
              <div className="population access-card">
                <div className="access-icon">
                  <svg width="48" xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle r="4" cx="12" cy="7" />
                    </g>
                  </svg>
                </div>
                <h3 className="access-title">Quản lý nhân khẩu</h3>
                <p className="access-description">
                  Theo dõi và cập nhật thông tin cá nhân, hộ tịch, và biến động dân số
                </p>
                <Link to="/population" className="btn-primary btn">
                  <span>Truy cập</span>
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
              <div className="household access-card">
                <div className="access-icon">
                  <svg width="48" xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                      <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </g>
                  </svg>
                </div>
                <h3 className="access-title">Quản lý hộ khẩu</h3>
                <p className="access-description">
                  Đăng ký, chỉnh sửa thông tin hộ gia đình và theo dõi thành viên
                </p>
                <Link to="/household" className="btn-secondary btn">
                  <span>Truy cập</span>
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
              <div className="fees access-card">
                <div className="access-icon">
                  <svg width="48" xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                      <path d="m19 9l-5 5l-4-4l-3 3" />
                    </g>
                  </svg>
                </div>
                <h3 className="access-title">Thu phí &amp; đóng góp</h3>
                <p className="access-description">
                  Quản lý các khoản thu, thanh toán và báo cáo tài chính chi tiết
                </p>
                <Link to="/fees" className="btn-accent btn">
                  <span>Truy cập</span>
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
        </section>
        <section id="login-cta" className="login-cta">
          <div className="cta-background">
            <video
              src="https://videos.pexels.com/video-files/3129671/3129671-hd_1280_720_30fps.mp4"
              loop
              muted
              autoPlay
              className="cta-video"
            />
            <div className="cta-overlay" />
          </div>
          <div className="cta-content">
            <h2 className="cta-title">Sẵn sàng khám phá tương lai?</h2>
            <p className="cta-subtitle">
              Tham gia cùng hàng nghìn tổ chức đã tin tưởng InfoFuturist
            </p>
            <div className="cta-actions">
              <Link to="/login" className="btn-xl btn-primary btn">
                <svg width="20" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle r="4" cx="12" cy="7" />
                  </g>
                </svg>
                <span>Đăng nhập</span>
              </Link>
              <Link to="/signup" className="btn-outline btn-xl btn">Đăng ký</Link>
            </div>
            <div className="cta-features">
              <div className="cta-feature">
                <svg width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24">
                  <path
                    d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Bảo mật tuyệt đối</span>
              </div>
              <div className="cta-feature">
                <svg width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 32">
                  <path
                    d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Hiệu suất cao</span>
              </div>
              <div className="cta-feature">
                <svg width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M3 5v14a9 3 0 0 0 18 0V5" />
                    <path d="M3 12a9 3 0 0 0 18 0" />
                  </g>
                </svg>
                <span>Dữ liệu thời gian thực</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;