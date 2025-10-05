import React, { useEffect } from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  useEffect(() => {
    const footer = document.querySelector('.footer-main') as HTMLElement | null;
    const socialLinks = document.querySelectorAll('.footer-social-link') as NodeListOf<HTMLElement>;
    const newsletterForm = document.querySelector('.footer-newsletter-form') as HTMLFormElement | null;
    const newsletterInput = document.querySelector('.footer-newsletter-input') as HTMLInputElement | null;

    // Glowing effect on scroll
    const handleFooterGlow = () => {
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const isVisible = footerRect.top < window.innerHeight && footerRect.bottom > 0;
        if (isVisible) {
          const visibility = Math.max(0, Math.min(1, (window.innerHeight - footerRect.top) / window.innerHeight));
          footer.style.setProperty('--footer-glow-opacity', visibility.toString());
        }
      }
    };

    // Enhanced social link hover effects
    socialLinks.forEach((link) => {
      link.addEventListener('mouseenter', function (this: HTMLElement) {
        this.style.transform = 'translateY(-4px) scale(1.05)';
        this.style.boxShadow = '0 8px 25px rgba(var(--color-accent-rgb), 0.4)';
      });

      link.addEventListener('mouseleave', function (this: HTMLElement) {
        this.style.transform = 'translateY(-2px) scale(1)';
        this.style.boxShadow = '0 0 20px rgba(var(--color-accent-rgb), 0.3)';
      });
    });

    // Newsletter form enhancement
    if (newsletterForm && newsletterInput) {
      newsletterForm.addEventListener('submit', function (this: HTMLFormElement, e: Event) {
        e.preventDefault();
        const input = newsletterInput as HTMLInputElement;
        const email = input.value.trim();
        const button = this.querySelector('.footer-newsletter-btn') as HTMLElement | null;
        if (email && isValidEmail(email)) {
          if (button) {
            const originalText = button.textContent;
            button.textContent = 'Đã Đăng Ký!';
            button.style.background = 'var(--color-accent)';
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
              button.textContent = originalText;
              button.style.background = '';
              button.style.transform = '';
              input.value = '';
            }, 2000);
          }
          showNotification('Đăng ký thành công! Cảm ơn bạn đã quan tâm.', 'success');
        } else {
          showNotification('Vui lòng nhập email hợp lệ.', 'error');
        }
      });

      newsletterInput.addEventListener('input', function (this: HTMLInputElement) {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
          this.style.borderColor = 'var(--color-accent)';
          this.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.2)';
        } else {
          this.style.borderColor = '';
          this.style.boxShadow = '';
        }
      });
    }

    // Email validation helper
    const isValidEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    // Simple notification system
    const showNotification = (message: string, type = 'info') => {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        background: ${type === 'success' ? 'var(--color-accent)' : '#ff6b6b'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(notification);
      requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
      });
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    };

    // Parallax effect for background elements
    const initParallaxEffect = () => {
      const glowElements = document.querySelectorAll('.footer-glow-top, .footer-glow-bottom') as NodeListOf<HTMLElement>;
      const updateParallax = () => {
        if (footer) {
          const scrolled = window.pageYOffset;
          const footerRect = footer.getBoundingClientRect();
          if (footerRect.top < window.innerHeight) {
            glowElements.forEach((element, index) => {
              const speed = index % 2 === 0 ? 0.3 : -0.2;
              const yPos = scrolled * speed;
              element.style.transform = `translateY(${yPos}px)`;
            });
          }
        }
      };
      window.addEventListener('scroll', updateParallax, { passive: true });
      return () => window.removeEventListener('scroll', updateParallax);
    };

    // Intersection Observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };
    const footerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('footer-animate-in');
          const sections = entry.target.querySelectorAll('.footer-section') as NodeListOf<HTMLElement>;
          sections.forEach((section, index) => {
            setTimeout(() => {
              section.style.opacity = '1';
              section.style.transform = 'translateY(0)';
            }, index * 100);
          });
        }
      });
    }, observerOptions);
    if (footer) footerObserver.observe(footer);

    // Initial styles for animation
    const sections = document.querySelectorAll('.footer-section') as NodeListOf<HTMLElement>;
    sections.forEach((section) => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    window.addEventListener('scroll', handleFooterGlow, { passive: true });
    const cleanupParallax = initParallaxEffect();

    return () => {
      window.removeEventListener('scroll', handleFooterGlow);
      cleanupParallax();
      if (footer) footerObserver.unobserve(footer);
      socialLinks.forEach((link) => {
        link.removeEventListener('mouseenter', () => {});
        link.removeEventListener('mouseleave', () => {});
      });
      if (newsletterForm) newsletterForm.removeEventListener('submit', () => {});
      if (newsletterInput) newsletterInput.removeEventListener('input', () => {});
    };
  }, []);

  return (
    <div className="footer-container1">
      <footer className="footer-main">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-brand footer-section">
              <div className="footer-logo">
                <h3 className="footer-logo-text">InfoFuturist</h3>
                <div className="footer-tagline">
                  <span>Quản lý thông tin tương lai</span>
                </div>
              </div>
              <p className="footer-description">
                Giải pháp quản lý thông tin nhân khẩu, hộ khẩu và thu phí hiện đại với công nghệ tiên tiến, mang đến trải nghiệm tương lai cho việc quản lý dữ liệu cộng đồng.
              </p>
              <div className="footer-social">
                <a href="#">
                  <div aria-label="Facebook" className="footer-social-link">
                    <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
                      <path
                        d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </a>
                <a href="#">
                  <div aria-label="Twitter" className="footer-social-link">
                    <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
                      <path
                        d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6c2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4c-.9-4.2 4-6.6 7-3.8c1.1 0 3-1.2 3-1.2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </a>
                <a href="#">
                  <div aria-label="LinkedIn" className="footer-social-link">
                    <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
                      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2a2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6M2 9h4v12H2z" />
                        <circle r="2" cx="4" cy="4" />
                      </g>
                    </svg>
                  </div>
                </a>
                <a href="#">
                  <div aria-label="YouTube" className="footer-social-link">
                    <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
                      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.5 17a24.1 24.1 0 0 1 0-10a2 2 0 0 1 1.4-1.4a49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.1 24.1 0 0 1 0 10a2 2 0 0 1-1.4 1.4a49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                        <path d="m10 15l5-3l-5-3z" />
                      </g>
                    </svg>
                  </div>
                </a>
              </div>
            </div>
            <div className="footer-nav footer-section">
              <h4 className="footer-heading">Điều Hướng</h4>
              <ul className="footer-links">
                <li>
                  <a href="#">
                    <div className="footer-link">
                      <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                          <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        </g>
                      </svg>
                      <span>Trang Chủ</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <div className="footer-link">
                      <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87" />
                          <circle r="4" cx="9" cy="7" />
                        </g>
                      </svg>
                      <span>Quản Lý Nhân Khẩu</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <div className="footer-link">
                      <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <ellipse cx="12" cy="5" rx="9" ry="3" />
                          <path d="M3 5v14a9 3 0 0 0 18 0V5" />
                          <path d="M3 12a9 3 0 0 0 18 0" />
                        </g>
                      </svg>
                      <span>Quản Lý Hộ Khẩu</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <div className="footer-link">
                      <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="5" rx="2" width="20" height="14" />
                          <path d="M2 10h20" />
                        </g>
                      </svg>
                      <span>Thu Phí &amp; Đóng Góp</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-section footer-services">
              <h4 className="footer-heading">Dịch Vụ</h4>
              <ul className="footer-links">
                <li>
                  <a href="#">
                    <div className="footer-link">
                      <span>Đăng Ký Tài Khoản</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <div className="footer-link">
                      <span>Đăng Nhập Hệ Thống</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <div className="footer-link">
                      <span>Báo Cáo Thống Kê</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <div className="footer-link">
                      <span>Hỗ Trợ Kỹ Thuật</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <div className="footer-link">
                      <span>Tài Liệu Hướng Dẫn</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-contact footer-section">
              <h4 className="footer-heading">Liên Hệ</h4>
              <div className="footer-contact-info">
                <div className="footer-contact-item">
                  <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                      <circle r="3" cx="12" cy="10" />
                    </g>
                  </svg>
                  <span>Đại học Bách Khoa Hà Nội, TP.Hà Nội</span>
                </div>
                <div className="footer-contact-item">
                  <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
                    <path
                      d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233a14 14 0 0 0 6.392 6.384"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>+84 389 891 942</span>
                </div>
                <div className="footer-contact-item">
                  <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 7l-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                      <rect x="2" y="4" rx="2" width="20" height="16" />
                    </g>
                  </svg>
                  <span>manhtrana1k45tl@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-newsletter">
            <div className="footer-newsletter-content">
              <h3 className="footer-newsletter-title">Đăng Ký Nhận Thông Tin Mới</h3>
              <p className="footer-newsletter-description">
                Nhận cập nhật về tính năng mới và thông báo hệ thống
              </p>
              <form action="#" method="POST" className="footer-newsletter-form">
                <input
                  type="email"
                  required
                  placeholder="Nhập email của bạn"
                  className="footer-newsletter-input"
                />
                <button type="submit" className="footer-newsletter-btn btn-primary btn">
                  Đăng Ký
                </button>
              </form>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <div className="footer-copyright">
                <p>&copy; 2025 InfoFuturist. Tất cả quyền được bảo lưu.</p>
              </div>
              <div className="footer-legal">
                <a href="#">
                  <div className="footer-legal-link">
                    <span>Chính Sách Bảo Mật</span>
                  </div>
                </a>
                <a href="#">
                  <div className="footer-legal-link">
                    <span>Điều Khoản Sử Dụng</span>
                  </div>
                </a>
                <a href="#">
                  <div className="footer-legal-link">
                    <span>Hỗ Trợ</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bg-effects">
          <div className="footer-grid-pattern" />
          <div className="footer-glow-top" />
          <div className="footer-glow-bottom" />
        </div>
      </footer>
    </div>
  );
};

export default Footer;