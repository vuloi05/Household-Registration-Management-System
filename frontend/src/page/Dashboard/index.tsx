import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Space } from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  DollarOutlined,
  RiseOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/charts';
import { statisticsService } from '@services/statistics.service';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>({});

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const data = await statisticsService.getDashboardStats();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const demographicData = [
    { type: 'Nam', value: statistics.maleCount || 0 },
    { type: 'Nữ', value: statistics.femaleCount || 0 },
  ];

  const monthlyTrendConfig = {
    data: statistics.monthlyTrend || [],
    xField: 'month',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  const pieConfig = {
    appendPadding: 10,
    data: demographicData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  const recentActivities = [
    {
      key: '1',
      time: '10:30',
      action: 'Thêm nhân khẩu mới',
      user: 'Nguyễn Văn A',
      detail: 'Hộ khẩu #HK001',
    },
    {
      key: '2',
      time: '09:45',
      action: 'Thu phí vệ sinh',
      user: 'Trần Thị B',
      detail: '500,000 VNĐ',
    },
    {
      key: '3',
      time: '08:20',
      action: 'Cấp giấy tạm vắng',
      user: 'Lê Văn C',
      detail: '3 tháng',
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2>Tổng quan</h2>
        <Space>
          <CalendarOutlined />
          <span>{new Date().toLocaleDateString('vi-VN')}</span>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số hộ khẩu"
              value={statistics.totalHouseholds || 0}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng nhân khẩu"
              value={statistics.totalResidents || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tạm vắng"
              value={statistics.temporaryAbsent || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Thu phí tháng này"
              value={statistics.monthlyFeeCollection || 0}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Biến động dân số" loading={loading}>
            <Line {...monthlyTrendConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Cơ cấu giới tính" loading={loading}>
            <Pie {...pieConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Thu phí">
            <div className={styles.feeProgress}>
              <div className={styles.feeItem}>
                <span>Phí vệ sinh</span>
                <Progress percent={85} status="active" />
              </div>
              <div className={styles.feeItem}>
                <span>Quỹ từ thiện</span>
                <Progress percent={60} status="active" />
              </div>
              <div className={styles.feeItem}>
                <span>Phí bảo vệ</span>
                <Progress percent={72} status="active" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Hoạt động gần đây">
            <Table
              dataSource={recentActivities}
              columns={[
                { title: 'Thời gian', dataIndex: 'time', key: 'time', width: 80 },
                { title: 'Hoạt động', dataIndex: 'action', key: 'action' },
                { title: 'Người thực hiện', dataIndex: 'user', key: 'user' },
                { title: 'Chi tiết', dataIndex: 'detail', key: 'detail' },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;