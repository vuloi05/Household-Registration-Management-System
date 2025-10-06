import React from 'react'
import './Header.css'

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="30" fill="#FFD700"/>
            <polygon points="30,10 35,25 50,25 38,35 43,50 30,40 17,50 22,35 10,25 25,25" fill="#DC143C"/>
          </svg>
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
