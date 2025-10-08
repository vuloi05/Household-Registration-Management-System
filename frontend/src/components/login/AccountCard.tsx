import React from 'react'
import { useNavigate } from 'react-router-dom'
import './AccountCard.css'

interface AccountCardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  description: string
  target: string
}

const AccountCard: React.FC<AccountCardProps> = ({
  icon,
  title,
  subtitle,
  description,
  target
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (
      title === 'Tài khoản cấp bởi' &&
      subtitle === 'Quản lý thông minh' &&
      description === 'quốc gia dành cho' &&
      target === 'Doanh nghiệp/Tổ chức'
    ) {
      navigate('/login/admin')
    }
  }

  return (
    <div className="account-card" onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}>
      <div className="card-icon">
        {icon}
      </div>
      <div className="card-content">
        <div className="card-title">{title}</div>
        <div className="card-subtitle">{subtitle}</div>
        <div className="card-description">{description}</div>
        <div className="card-target">{target}</div>
      </div>
    </div>
  )
}

export default AccountCard