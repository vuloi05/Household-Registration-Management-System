import React from 'react'
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
  return (
    <div className="account-card">
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