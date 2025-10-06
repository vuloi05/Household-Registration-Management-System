import React from 'react'
import AccountCard from './AccountCard'
import NotificationBox from './NotificationBox'
import './LoginSection.css'

const LoginSection: React.FC = () => {
  const accountTypes = [
    {
      icon: (
        <img src="/quoc_huy.svg" width={40} height={40} alt="Quốc huy" />
      ),
      title: "Tài khoản cấp bởi",
      subtitle: "Cổng dịch vụ công",
      description: "quốc gia dành cho",
      target: "Doanh nghiệp/Tổ chức"
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="8" fill="#228B22"/>
          <polygon points="20,10 23,18 33,18 25,24 28,34 20,28 12,34 15,24 7,18 17,18" fill="#FFD700"/>
        </svg>
      ),
      title: "Tài khoản Định danh",
      subtitle: "điện tử cấp bởi Bộ",
      description: "Công an dành cho",
      target: "Công dân"
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="8" fill="#228B22"/>
          <polygon points="20,10 23,18 33,18 25,24 28,34 20,28 12,34 15,24 7,18 17,18" fill="#FFD700"/>
        </svg>
      ),
      title: "Tài khoản Định danh",
      subtitle: "điện tử cấp bởi Bộ",
      description: "Công an dành cho Tổ",
      target: "chức, doanh nghiệp"
    }
  ]

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
        
        <NotificationBox />
      </div>
    </div>
  )
}

export default LoginSection
