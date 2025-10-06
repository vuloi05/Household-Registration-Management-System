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
        <img src="/vneid.png" width={40} height={40} alt="VNeID" />
      ),
      title: "Tài khoản Định danh",
      subtitle: "điện tử cấp bởi Bộ",
      description: "Công an dành cho",
      target: "Công dân"
    },
    {
      icon: (
        <img src="/vneid.png" width={40} height={40} alt="VNeID" />
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
