import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  DollarOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@store/hooks/hooks';
import { logout } from '@store/slices/authSlice';
import styles from './MainLayout.module.css';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Trang chủ',
    },
    {
      key: '/households',
      icon: <TeamOutlined />,
      label: 'Quản lý hộ khẩu',
    },
    {
      key: '/residents',
      icon: <UserOutlined />,
      label: 'Quản lý nhân khẩu',
    },
    {
      key: '/fees',
      icon: <DollarOutlined />,
      label: 'Quản lý thu phí',
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: 'Thống kê báo cáo',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: () => {
        dispatch(logout());
        navigate('/login');
      },
    },
  ];

  return (
    <Layout className={styles.layout}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
        <div className={styles.logo}>
          {collapsed ? 'QL' : 'Quản lý dân cư'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: styles.trigger,
              onClick: () => setCollapsed(!collapsed),
            })}
          </div>
          <div className={styles.headerRight}>
            <Space size={24}>
              <Badge count={5}>
                <BellOutlined style={{ fontSize: 20 }} />
              </Badge>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Space className={styles.userInfo}>
                  <Avatar src={user?.avatar}>
                    {user?.fullName?.charAt(0)}
                  </Avatar>
                  <span>{user?.fullName}</span>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;