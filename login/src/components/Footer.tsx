import React from 'react'
import './Footer.css'

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-item">
          <span className="footer-label">Cơ quan chủ quản:</span>
          <span className="footer-value">Văn phòng Chính phủ</span>
        </div>
        <div className="footer-item">
          <span className="footer-value">www.dichvucong.gov.vn</span>
        </div>
        <div className="footer-item">
          <span className="footer-label">Tổng đài hỗ trợ:</span>
          <span className="footer-value">18001096</span>
        </div>
        <div className="footer-item">
          <span className="footer-label">Email:</span>
          <span className="footer-value">dichvucong@chinhphu.vn</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
