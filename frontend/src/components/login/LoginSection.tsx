import React, { useEffect } from 'react'
import AccountCard from './AccountCard'
import './LoginSection.css'

const LoginSection: React.FC = () => {
  const accountTypes = [
    {
      icon: (
        <img src="/login/quoc_huy.svg" width={40} height={40} alt="Quốc huy" />
      ),
      title: "Tài khoản cấp bởi",
      subtitle: "Cổng dịch vụ công",
      description: "quốc gia dành cho",
      target: "Doanh nghiệp/Tổ chức"
    },
    {
      icon: (
        <img src="/login/vneid.png" width={40} height={40} alt="VNeID" />
      ),
      title: "Tài khoản Định danh",
      subtitle: "điện tử cấp bởi Bộ",
      description: "Công an dành cho",
      target: "Công dân"
    },
    {
      icon: (
        <img src="/login/vneid.png" width={40} height={40} alt="VNeID" />
      ),
      title: "Tài khoản Định danh",
      subtitle: "điện tử cấp bởi Bộ",
      description: "Công an dành cho Tổ",
      target: "chức, doanh nghiệp"
    }
  ]

  useEffect(() => {
    // Intersection Observer for animations (match Home access cards)
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

    const cards = document.querySelectorAll('.account-card') as NodeListOf<HTMLElement>;
    cards.forEach((el) => {
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });

    // Icon glow effects on hover (mirror Home.tsx behavior)
    const handleMouseEnter = (card: HTMLElement) => {
      const icon = card.querySelector('.card-icon') as HTMLElement | null;
      if (icon) {
        icon.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.6), 0 0 60px rgba(0, 255, 255, 0.4)';
        icon.style.transform = 'scale(1.1)';
      }
    };
    const handleMouseLeave = (card: HTMLElement) => {
      const icon = card.querySelector('.card-icon') as HTMLElement | null;
      if (icon) {
        icon.style.boxShadow = '';
        icon.style.transform = '';
      }
    };
    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => handleMouseEnter(card));
      card.addEventListener('mouseleave', () => handleMouseLeave(card));
    });

    // Ripple effect for buttons inside login section (same as Home)
    const container = document.querySelector('.login-section') as HTMLElement | null;
    const buttons = container ? (container.querySelectorAll('.btn') as NodeListOf<HTMLElement>) : ([] as unknown as NodeListOf<HTMLElement>);
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
      cards.forEach((el) => observer.unobserve(el));
      cards.forEach((card) => {
        card.removeEventListener('mouseenter', () => handleMouseEnter(card));
        card.removeEventListener('mouseleave', () => handleMouseLeave(card));
      });
      buttons.forEach((button) => {
        button.removeEventListener('click', (e: MouseEvent) => handleButtonClick(e, button));
      });
    };
  }, []);

  return (
    <div className="login-section">
      <div className="login-container">
        <h2>Đăng nhập</h2>
        <p className="login-subtitle">
          Chọn loại tài khoản bạn muốn sử dụng đăng nhập<br />
          Cổng dịch vụ công Quốc gia
        </p>
        <div className="account-cards">
          {accountTypes.map((account, index) => (
            <AccountCard key={index} {...account} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default LoginSection