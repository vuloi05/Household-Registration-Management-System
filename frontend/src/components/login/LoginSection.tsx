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

    return () => {
      cards.forEach((el) => observer.unobserve(el));
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