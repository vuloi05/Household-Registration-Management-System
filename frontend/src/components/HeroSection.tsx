import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  useEffect(() => {
    // Parallax effect for hero video
    const heroVideo = document.querySelector('.hero-video') as HTMLVideoElement | null;
    const heroOverlay = document.querySelector('.hero-overlay') as HTMLElement | null;

    if (heroVideo && heroOverlay) {
      const handleScroll = () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        heroVideo.style.transform = `translateY(${rate}px)`;
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }

    // Animated counters for hero stats
    const animateCounters = () => {
      const counters = document.querySelectorAll('.stat-number') as NodeListOf<HTMLElement>;
      counters.forEach((counter) => {
        const target = counter.textContent || '';
        const numericValue = target.replace(/[^\d.]/g, '');
        const suffix = target.replace(/[\d.,]/g, '');

        if (numericValue) {
          const increment = parseFloat(numericValue) / 100;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= parseFloat(numericValue)) {
              current = parseFloat(numericValue);
              clearInterval(timer);
            }

            if (suffix === 'K+') {
              counter.textContent = Math.floor(current) + 'K+';
            } else if (suffix === '%') {
              counter.textContent = current.toFixed(1) + '%';
            } else if (suffix === 'B') {
              counter.textContent = '₫' + current.toFixed(1) + 'B';
            } else {
              counter.textContent = current.toFixed(1) + suffix;
            }
          }, 50);
        }
      });
    };

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
          if (target.classList.contains('hero-stats')) {
            setTimeout(animateCounters, 500);
          }
        }
      });
    }, observerOptions);

    // Observe elements for scroll animations
    const elementsToAnimate = document.querySelectorAll('.hero-stats') as NodeListOf<HTMLElement>;
    elementsToAnimate.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });

    // Floating cards animation enhancement
    const floatingCards = document.querySelectorAll('.floating-card') as NodeListOf<HTMLElement>;
    const handleMouseEnterCard = (card: HTMLElement) => {
      card.style.transform = 'translateY(-10px) scale(1.05)';
      card.style.boxShadow = '0 20px 40px rgba(0, 255, 255, 0.3)';
    };
    const handleMouseLeaveCard = (card: HTMLElement) => {
      card.style.transform = '';
      card.style.boxShadow = '';
    };
    floatingCards.forEach((card) => {
      card.addEventListener('mouseenter', () => handleMouseEnterCard(card));
      card.addEventListener('mouseleave', () => handleMouseLeaveCard(card));
    });

    // Preload videos for better performance
    const videos = document.querySelectorAll('video') as NodeListOf<HTMLVideoElement>;
    videos.forEach((video) => {
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
    });

    // Cleanup
    return () => {
      if (heroVideo && heroOverlay) {
        window.removeEventListener('scroll', () => {});
      }
      elementsToAnimate.forEach((el) => observer.unobserve(el));
      floatingCards.forEach((card) => {
        card.removeEventListener('mouseenter', () => handleMouseEnterCard(card));
        card.removeEventListener('mouseleave', () => handleMouseLeaveCard(card));
      });
    };
  }, []);

  return (
    <section id="hero" className="hero">
      <div className="hero-background">
        <video
          src="https://videos.pexels.com/video-files/3141210/3141210-hd_1280_720_25fps.mp4"
          loop
          muted
          autoPlay
          className="hero-video"
        />
        <div className="hero-overlay" />
        <div className="hero-grid-pattern" />
      </div>
      <div className="hero-content">
        <div className="hero-brand">
          <div className="brand-icon">
            <svg width="32" xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5v14a9 3 0 0 0 18 0V5" />
                <path d="M3 12a9 3 0 0 0 18 0" />
              </g>
            </svg>
          </div>
          <span className="brand-text">InfoFuturist</span>
        </div>
        <h1 className="hero-title">
          <span>Quản lý thông tin </span>
          <span className="home-hero-title-accent">tương lai</span>
        </h1>
        <p className="hero-subtitle">
          Hệ thống quản lý nhân khẩu, hộ khẩu và thu phí hiện đại với công nghệ AI tiên tiến
        </p>
        <div className="hero-actions">
          <Link to="/login" className="btn-lg btn-primary btn">Đăng nhập</Link>
          <Link to="/signup" className="btn-outline btn-lg btn">Đăng ký</Link>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Hộ gia đình</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Độ chính xác</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Hỗ trợ</div>
          </div>
        </div>
      </div>
      <div className="hero-floating-elements">
        <div className="card-1 floating-card">
          <div className="card-icon">
            <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle r="4" cx="12" cy="7" />
              </g>
            </svg>
          </div>
          <div className="card-content">
            <div className="card-title">Nhân khẩu</div>
            <div className="card-value">125,847</div>
          </div>
        </div>
        <div className="floating-card card-2">
          <div className="card-icon">
            <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </g>
            </svg>
          </div>
          <div className="card-content">
            <div className="card-title">Hộ khẩu</div>
            <div className="card-value">45,233</div>
          </div>
        </div>
        <div className="floating-card card-3">
          <div className="card-icon">
            <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                <path d="m19 9l-5 5l-4-4l-3 3" />
              </g>
            </svg>
          </div>
          <div className="card-content">
            <div className="card-title">Thu phí</div>
            <div className="card-value">₫2.5B</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;