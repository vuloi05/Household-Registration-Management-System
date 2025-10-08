import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
// import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  useEffect(() => {
    // Intersection Observer for animations - Observer để tạo hiệu ứng animation
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1, // Trigger when 10% visible - Kích hoạt khi 10% hiển thị
      rootMargin: '0px 0px -50px 0px', // Bottom margin - Khoảng cách dưới
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { // When element is visible - Khi phần tử hiển thị
          const target = entry.target as HTMLElement;
          target.style.opacity = '1'; // Make visible - Làm cho hiển thị
          target.style.transform = 'translateY(0)'; // Reset position - Đặt lại vị trí
        }
      });
    }, observerOptions);

    // Observe elements for scroll animations - Quan sát các phần tử để tạo hiệu ứng cuộn
    const dashboardCards = document.querySelectorAll('.dashboard-card') as NodeListOf<HTMLElement>;
    dashboardCards.forEach((el) => {
      el.style.opacity = '0'; // Initially hidden - Ban đầu ẩn
      el.style.transform = 'translateY(30px)'; // Start below - Bắt đầu ở dưới
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'; // Smooth transition - Chuyển tiếp mượt mà
      observer.observe(el); // Start observing - Bắt đầu quan sát
    });

    // Dashboard card hover effects - Hiệu ứng hover cho các card dashboard
    const handleMouseEnterCard = (card: HTMLElement) => {
      const icon = card.querySelector('.dashboard-icon') as HTMLElement | null;
      if (icon) {
        icon.style.boxShadow = '0 0 30px rgba(255, 165, 0, 0.6), 0 0 60px rgba(255, 165, 0, 0.4)';
        icon.style.transform = 'scale(1.1)'; // Scale up - Phóng to
      }
    };
    const handleMouseLeaveCard = (card: HTMLElement) => {
      const icon = card.querySelector('.dashboard-icon') as HTMLElement | null;
      if (icon) {
        icon.style.boxShadow = ''; // Remove glow - Loại bỏ hiệu ứng phát sáng
        icon.style.transform = ''; // Reset scale - Đặt lại kích thước
      }
    };
    dashboardCards.forEach((card) => {
      card.addEventListener('mouseenter', () => handleMouseEnterCard(card)); 
      card.addEventListener('mouseleave', () => handleMouseLeaveCard(card)); 
    });

    // Cleanup - Dọn dẹp
    return () => {
      dashboardCards.forEach((el) => observer.unobserve(el));
      dashboardCards.forEach((card) => {
        card.removeEventListener('mouseenter', () => handleMouseEnterCard(card));
        card.removeEventListener('mouseleave', () => handleMouseLeaveCard(card));
      });
    };
  }, []);

  return (
    <div className="dashboard-container">
      <Helmet>
        <title>Dashboard - InfoFuturist</title>
        <meta property="og:title" content="Dashboard - InfoFuturist" />
      </Helmet>
      <Navigation />
      <main className="dashboard-main">
        {/* Dashboard Header */}
        <section className="dashboard-header">
          <div className="dashboard-header-content">
            <h1 className="dashboard-title">
              <span className="dashboard-title-main">Bảng điều khiển</span>
              <span className="dashboard-title-sub">Quản lý hệ thống</span>
            </h1>
            <p className="dashboard-subtitle">
              Tổng quan toàn diện về hệ thống quản lý nhân khẩu, hộ khẩu và thu phí
            </p>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="dashboard-metrics">
          <div className="metrics-grid">
            <div className="metric-card population-metric">
              <div className="metric-icon">
                <svg width="32" xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle r="4" cx="12" cy="7" />
                  </g>
                </svg>
              </div>
              <div className="metric-content">
                <h3 className="metric-title">NHÂN KHẨU</h3>
                <div className="metric-value">125,847</div>
                <div className="metric-change positive">+2.5% so với tháng trước</div>
              </div>
            </div>

            <div className="metric-card household-metric">
              <div className="metric-icon">
                <svg width="32" xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                    <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </g>
                </svg>
              </div>
              <div className="metric-content">
                <h3 className="metric-title">HỘ KHẨU</h3>
                <div className="metric-value">45,233</div>
                <div className="metric-change positive">+1.8% so với tháng trước</div>
              </div>
            </div>

            <div className="metric-card revenue-metric">
              <div className="metric-icon">
                <svg width="32" xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                    <path d="m19 9l-5 5l-4-4l-3 3" />
                  </g>
                </svg>
              </div>
              <div className="metric-content">
                <h3 className="metric-title">THU PHÍ</h3>
                <div className="metric-value">₫2.58B</div>
                <div className="metric-change positive">+12.3% so với tháng trước</div>
              </div>
            </div>

            <div className="metric-card efficiency-metric">
              <div className="metric-icon">
                <svg width="32" xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 0-7-2-7-5V6c0-3 2-5 7-5s7 2 7 5v8c0 3-2 5-7 5z" />
                    <path d="M15 9v6" />
                    <path d="M12 12h6" />
                  </g>
                </svg>
              </div>
              <div className="metric-content">
                <h3 className="metric-title">HIỆU SUẤT</h3>
                <div className="metric-value">99.9%</div>
                <div className="metric-change positive">+0.1% so với tháng trước</div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Content Grid - Lưới nội dung dashboard */}
        <section className="dashboard-content">
          <div className="dashboard-grid">
            {/* Quick Actions - Thao tác nhanh */}
            {/* <div className="dashboard-card quick-actions">
              <div className="card-header">
                <h3 className="card-title">Thao tác nhanh</h3>
                <div className="dashboard-icon">
                  <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </g>
                  </svg>
                </div>
              </div>
              <div className="card-content">
                <div className="action-buttons">
                  <Link to="/population" className="action-btn primary">
                    <svg width="20" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24">
                      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle r="4" cx="12" cy="7" />
                      </g>
                    </svg>
                    <span>Quản lý nhân khẩu</span>
                  </Link>
                  <Link to="/household" className="action-btn secondary">
                    <svg width="20" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24">
                      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                        <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </g>
                    </svg>
                    <span>Quản lý hộ khẩu</span>
                  </Link>
                  <Link to="/fees" className="action-btn accent">
                    <svg width="20" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24">
                      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                        <path d="m19 9l-5 5l-4-4l-3 3" />
                      </g>
                    </svg>
                    <span>Thu phí & đóng góp</span>
                  </Link>
                  <Link to="/reports" className="action-btn info">
                    <svg width="20" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24">
                      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                        <path d="M7 7h10" />
                        <path d="M7 11h4" />
                        <path d="M7 15h6" />
                      </g>
                    </svg>
                    <span>Báo cáo & thống kê</span>
                  </Link>
                </div>
              </div>
            </div> */}

            {/* Recent Activity - Hoạt động gần đây */}
            <div className="dashboard-card recent-activity">
              <div className="card-header">
                <h3 className="card-title">Hoạt động gần đây</h3>
                <div className="dashboard-icon">
                  <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </g>
                  </svg>
                </div>
              </div>
              <div className="card-content">
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon">
                      <svg width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle r="4" cx="12" cy="7" />
                        </g>
                      </svg>
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Cập nhật thông tin nhân khẩu</div>
                      <div className="activity-time">2 giờ trước</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <svg width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                          <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        </g>
                      </svg>
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Đăng ký hộ khẩu mới</div>
                      <div className="activity-time">4 giờ trước</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <svg width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                          <path d="m19 9l-5 5l-4-4l-3 3" />
                        </g>
                      </svg>
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Thu phí thành công</div>
                      <div className="activity-time">6 giờ trước</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status - Trạng thái hệ thống */}
            <div className="dashboard-card system-status">
              <div className="card-header">
                <h3 className="card-title">Trạng thái hệ thống</h3>
                <div className="dashboard-icon">
                  <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </g>
                  </svg>
                </div>
              </div>
              <div className="card-content">
                <div className="status-list">
                  <div className="status-item">
                    <div className="status-indicator online"></div>
                    <div className="status-content">
                      <div className="status-title">Hệ thống chính</div>
                      <div className="status-value">Hoạt động bình thường</div>
                    </div>
                  </div>
                  <div className="status-item">
                    <div className="status-indicator online"></div>
                    <div className="status-content">
                      <div className="status-title">Cơ sở dữ liệu</div>
                      <div className="status-value">Kết nối ổn định</div>
                    </div>
                  </div>
                  <div className="status-item">
                    <div className="status-indicator online"></div>
                    <div className="status-content">
                      <div className="status-title">API Services</div>
                      <div className="status-value">Phản hồi nhanh</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Chart Placeholder - Biểu đồ hiệu suất */}
            <div className="dashboard-card performance-chart">
              <div className="card-header">
                <h3 className="card-title">Hiệu suất hệ thống</h3>
                <div className="dashboard-icon">
                  <svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                      <path d="M7 7h10" />
                      <path d="M7 11h4" />
                      <path d="M7 15h6" />
                    </g>
                  </svg>
                </div>
              </div>
              <div className="card-content">
                <div className="chart-placeholder">
                  <div className="chart-info">
                    <div className="chart-title">Biểu đồ hiệu suất</div>
                    <div className="chart-subtitle">Dữ liệu 7 ngày qua</div>
                  </div>
                  <div className="chart-visual">
                    <div className="chart-bars">
                      <div className="chart-bar" style={{height: '60%'}}></div>
                      <div className="chart-bar" style={{height: '80%'}}></div>
                      <div className="chart-bar" style={{height: '70%'}}></div>
                      <div className="chart-bar" style={{height: '90%'}}></div>
                      <div className="chart-bar" style={{height: '85%'}}></div>
                      <div className="chart-bar" style={{height: '95%'}}></div>
                      <div className="chart-bar" style={{height: '100%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features - Tính năng chính */}
        <section className="dashboard-features">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-number">50K+</div> {/* Household count - Số lượng hộ gia đình */}
              <div className="feature-label">HỘ GIA ĐÌNH</div>
            </div>
            <div className="feature-item">
              <div className="feature-number">99.9%</div> {/* Accuracy rate - Tỷ lệ chính xác */}
              <div className="feature-label">ĐỘ CHÍNH XÁC</div>
            </div>
            <div className="feature-item">
              <div className="feature-number">24/7</div> {/* Support availability - Tính khả dụng hỗ trợ */}
              <div className="feature-label">HỖ TRỢ</div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
