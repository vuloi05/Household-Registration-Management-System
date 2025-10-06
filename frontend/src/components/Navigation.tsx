import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  useEffect(() => {
    const navigation = document.getElementById('navigation') as HTMLElement | null;
    const mobileToggle = document.getElementById('navigation-mobile-toggle') as HTMLButtonElement | null;
    const mobileMenu = document.getElementById('navigation-mobile-menu') as HTMLElement | null;
    let isMobileMenuOpen = false;

    // Toggle mobile menu
    const toggleMobileMenu = () => {
      isMobileMenuOpen = !isMobileMenuOpen;
      if (navigation) navigation.setAttribute('data-mobile-open', isMobileMenuOpen.toString());
      if (mobileToggle) mobileToggle.setAttribute('aria-expanded', isMobileMenuOpen.toString());
      if (isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
        if (mobileToggle) mobileToggle.setAttribute('aria-label', 'Đóng menu di động');
      } else {
        document.body.style.overflow = '';
        if (mobileToggle) mobileToggle.setAttribute('aria-label', 'Mở menu di động');
      }
    };

    // Close mobile menu when clicking outside
    const closeMobileMenuOnOutsideClick = (event: MouseEvent) => {
      if (isMobileMenuOpen && navigation && !navigation.contains(event.target as Node)) {
        toggleMobileMenu();
      }
    };

    // Close mobile menu when clicking on a link
    const closeMobileMenuOnLinkClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).matches('.navigation__mobile-link')) {
        setTimeout(() => {
          toggleMobileMenu();
        }, 200);
      }
    };

    // Handle scroll effects
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (navigation) {
        if (scrollY > 50) {
          navigation.style.background = 'color-mix(in srgb, var(--color-surface) 98%, transparent)';
          navigation.style.borderBottomColor = 'color-mix(in srgb, var(--color-primary) 30%, transparent)';
          navigation.style.boxShadow = '0 8px 32px color-mix(in srgb, var(--color-primary) 8%, transparent)';
        } else {
          navigation.style.background = 'color-mix(in srgb, var(--color-surface) 90%, transparent)';
          navigation.style.borderBottomColor = 'color-mix(in srgb, var(--color-primary) 20%, transparent)';
          navigation.style.boxShadow = 'none';
        }
      }
    };

    // Resize handler
    const handleResize = () => {
      if (window.innerWidth > 991 && isMobileMenuOpen) {
        toggleMobileMenu();
      }
    };

    // Smooth logo hover animation
    const logoIcon = document.querySelector('.navigation__logo-icon') as HTMLElement | null;
    const logoLink = document.querySelector('.navigation__logo-link') as HTMLElement | null;

    if (logoLink && logoIcon) {
      logoLink.addEventListener('mouseenter', () => {
        logoIcon.style.transform = 'scale(1.05) rotate(5deg)';
      });
      logoLink.addEventListener('mouseleave', () => {
        logoIcon.style.transform = 'scale(1) rotate(0deg)';
      });
    }

    // Add glow effect to navigation links
    const navLinks = document.querySelectorAll('.navigation__link, .navigation__mobile-link') as NodeListOf<HTMLElement>;
    navLinks.forEach((link) => {
      link.addEventListener('mouseenter', (event: MouseEvent) => {
        const rect = link.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        link.style.setProperty('--glow-x', `${x}px`);
        link.style.setProperty('--glow-y', `${y}px`);
      });
    });

    // Event listeners
    if (mobileToggle) mobileToggle.addEventListener('click', toggleMobileMenu);
    if (mobileMenu) mobileMenu.addEventListener('click', closeMobileMenuOnLinkClick);
    document.addEventListener('click', closeMobileMenuOnOutsideClick);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Keyboard navigation
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        toggleMobileMenu();
      }
    };
    document.addEventListener('keydown', handleKeydown);

    // Initialize scroll effects
    handleScroll();

    // Cleanup
    return () => {
      if (mobileToggle) mobileToggle.removeEventListener('click', toggleMobileMenu);
      if (mobileMenu) mobileMenu.removeEventListener('click', closeMobileMenuOnLinkClick);
      document.removeEventListener('click', closeMobileMenuOnOutsideClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeydown);
      if (logoLink) {
        logoLink.removeEventListener('mouseenter', () => {});
        logoLink.removeEventListener('mouseleave', () => {});
      }
      navLinks.forEach((link) => {
        link.removeEventListener('mouseenter', () => {});
      });
    };
  }, []);

  return (
    <div className="navigation-container1">
      <nav id="navigation" className="navigation">
        <div className="navigation__container">
          <div className="navigation__logo">
            <Link to="/">
              <div className="navigation__logo-link">
                <div className="navigation__logo-icon">
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
                <span className="navigation__logo-text">InfoFuturist</span>
              </div>
            </Link>
          </div>
          <div className="navigation__desktop">
            <ul className="navigation__menu">
              <li className="navigation__item">
                <Link to="/quan-ly-nhan-khau">
                  <div className="navigation__link">
                    <svg width="18" xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24">
                      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87" />
                        <circle r="4" cx="9" cy="7" />
                      </g>
                    </svg>
                    <span>Quản lý Nhân khẩu</span>
                  </div>
                </Link>
              </li>
              <li className="navigation__item">
                <Link to="/quan-ly-ho-khau">
                  <div className="navigation__link">
                    <svg width="18" xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24">
                      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                        <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </g>
                    </svg>
                    <span>Quản lý Hộ khẩu</span>
                  </div>
                </Link>
              </li>
              <li className="navigation__item">
                <Link to="/thu-phi">
                  <div className="navigation__link">
                    <svg width="18" xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24">
                      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" rx="2" width="20" height="14" />
                        <path d="M2 10h20" />
                      </g>
                    </svg>
                    <span>Thu phí &amp; Đóng góp</span>
                  </div>
                </Link>
              </li>
              <li className="navigation__item">
                <Link to="/bao-cao">
                  <div className="navigation__link">
                    <span>Báo cáo &amp; Thống kê</span>
                  </div>
                </Link>
              </li>
            </ul>
            <div className="navigation__actions">
              <button className="btn-outline navigation__login btn">Đăng nhập</button>
              <button className="btn-primary navigation__signup btn">Đăng ký</button>
            </div>
          </div>
          <button
            id="navigation-mobile-toggle"
            aria-label="Mở menu di động"
            aria-expanded="false"
            className="navigation__mobile-toggle"
          >
            <svg
              width="24"
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 24 24"
              className="navigation-navigationmenu-icon"
            >
              <path
                d="M4 5h16M4 12h16M4 19h16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              width="24"
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 24 24"
              className="navigation-navigationclose-icon"
            >
              <path
                d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1zm-5.5-3.5l-5 5m0-5l5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div id="navigation-mobile-menu" className="navigation__mobile">
          <div className="navigation__mobile-content">
            <ul className="navigation__mobile-menu">
              <li className="navigation__mobile-item">
                <Link to="/quan-ly-nhan-khau">
                  <div className="navigation__mobile-link">
                    <svg width="20" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24">
                      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87" />
                        <circle r="4" cx="9" cy="7" />
                      </g>
                    </svg>
                    <span>Quản lý Nhân khẩu</span>
                  </div>
                </Link>
              </li>
              <li className="navigation__mobile-item">
                <Link to="/quan-ly-ho-khau">
                  <div className="navigation__mobile-link">
                    <svg width="20" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24">
                      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                        <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </g>
                    </svg>
                    <span>Quản lý Hộ khẩu</span>
                  </div>
                </Link>
              </li>
              <li className="navigation__mobile-item">
                <Link to="/thu-phi">
                  <div className="navigation__mobile-link">
                    <svg width="20" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24">
                      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" rx="2" width="20" height="14" />
                        <path d="M2 10h20" />
                      </g>
                    </svg>
                    <span>Thu phí &amp; Đóng góp</span>
                  </div>
                </Link>
              </li>
              <li className="navigation__mobile-item">
                <Link to="/bao-cao">
                  <div className="navigation__mobile-link">
                    <span>Báo cáo &amp; Thống kê</span>
                  </div>
                </Link>
              </li>
            </ul>
            <div className="navigation__mobile-actions">
              <button className="btn-outline navigation__mobile-login btn">Đăng nhập</button>
              <button className="btn-primary navigation__mobile-signup btn">Đăng ký</button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navigation;