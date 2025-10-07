import React from 'react'
import './Header.css'

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <img src="/avatar.png" alt="Avatar" width="80" height="80" />
        </div>
        <div className="header-text">
          <h1>CỔNG DỊCH VỤ CÔNG QUỐC GIA</h1>
          <p>Kết nối, cung cấp thông tin và dịch vụ công mọi lúc, mọi nơi</p>
        </div>
      </div>
    </header>
  )
}

export default Header