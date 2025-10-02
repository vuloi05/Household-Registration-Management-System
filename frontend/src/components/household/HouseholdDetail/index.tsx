import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Button, 
  Space, 
  Tabs, 
  Table, 
  Tag,
  Spin,
  Modal,
  message 
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined,
  FileTextOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { Household, HouseholdChange } from '@types/household.types';
import { Resident } from '@types/resident.types';
import { householdService } from '@services/household.service';
import { residentService } from '@services/resident.service';
import ResidentForm from '@components/resident/ResidentForm';
import styles from './HouseholdDetail.module.css';

const HouseholdDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<Resident[]>([]);
  const [history, setHistory] = useState<HouseholdChange[]>([]);
  const [showResidentForm, setShowResidentForm] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  useEffect(() => {
    if (id) {
      fetchHouseholdDetail();
      fetchMembers();
      fetchHistory();
    }
  }, [id]);

  const fetchHouseholdDetail = async () => {
    setLoading(true);
    try {
      const data = await householdService.getById(Number(id));
      setHousehold(data);
    } catch (error) {
      message.error('Không thể tải thông tin hộ khẩu');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await householdService.getMembers(Number(id));
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await householdService.getHistory(Number(id));
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const memberColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: Resident) => (
        <Space>
          {text}
          {record.id === household?.headOfHouseholdId && (
            <Tag color="gold">Chủ hộ</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      width: 120,
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
      render: (gender: string) => (gender === 'MALE' ? 'Nam' : 'Nữ'),
    },
    {
      title: 'CMND/CCCD',
      dataIndex: ['identityCard', 'number'],
      key: 'identityCard',
      width: 150,
    },
    {
      title: 'Quan hệ với chủ hộ',
      dataIndex: 'relationshipWithHead',
      key: 'relationshipWithHead',
      width: 150,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          PERMANENT: { text: 'Thường trú', color: 'green' },
          TEMPORARY_ABSENT: { text: 'Tạm vắng', color: 'orange' },
          TEMPORARY_RESIDENCE: { text: 'Tạm trú', color: 'blue' },
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_: any, record: Resident) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setSelectedResident(record);
            setShowResidentForm(true);
          }}
        />
      ),
    },
  ];

  const historyColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'changeDate',
      key: 'changeDate',
      width: 150,
    },
    {
      title: 'Loại thay đổi',
      dataIndex: 'changeType',
      key: 'changeType',
      width: 150,
    },
    {
      title: 'Nội dung',
      key: 'content',
      render: (record: HouseholdChange) => (
        <div>
          {record.oldValue && <div>Cũ: {record.oldValue}</div>}
          {record.newValue && <div>Mới: {record.newValue}</div>}
        </div>
      ),
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'performedBy',
      key: 'performedBy',
      width: 150,
    },
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  if (!household) {
    return <div>Không tìm thấy hộ khẩu</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/households')}
        >
          Quay lại
        </Button>
        <Space>
          <Button icon={<EditOutlined />}>Sửa thông tin</Button>
          <Button icon={<FileTextOutlined />}>Xuất báo cáo</Button>
        </Space>
      </div>

      <Card title="Thông tin hộ khẩu" className={styles.card}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã hộ khẩu">
            {household.householdCode}
          </Descriptions.Item>
          <Descriptions.Item label="Số hộ khẩu">
            {household.householdNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Chủ hộ">
            {household.headOfHousehold?.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Số nhân khẩu">
            {household.memberCount}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {household.address.fullAddress}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày đăng ký">
            {household.registrationDate}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={household.status === 'ACTIVE' ? 'green' : 'red'}>
              {household.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card className={styles.card}>
        <Tabs
          items={[
            {
              key: 'members',
              label: `Danh sách nhân khẩu (${members.length})`,
              icon: <TeamOutlined />,
              children: (
                <>
                  <div className={styles.tabHeader}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setSelectedResident(null);
                        setShowResidentForm(true);
                      }}
                    >
                      Thêm nhân khẩu
                    </Button>
                  </div>
                  <Table
                    dataSource={members}
                    columns={memberColumns}
                    rowKey="id"
                    pagination={false}
                  />
                </>
              ),
            },
            {
              key: 'history',
              label: 'Lịch sử thay đổi',
              icon: <HistoryOutlined />,
              children: (
                <Table
                  dataSource={history}
                  columns={historyColumns}
                  rowKey="id"
                  pagination={false}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={selectedResident ? 'Cập nhật nhân khẩu' : 'Thêm nhân khẩu mới'}
        open={showResidentForm}
        onCancel={() => setShowResidentForm(false)}
        footer={null}
        width={900}
      >
        <ResidentForm
          resident={selectedResident}
          householdId={Number(id)}
          onSuccess={() => {
            setShowResidentForm(false);
            fetchMembers();
          }}
          onCancel={() => setShowResidentForm(false)}
        />
      </Modal>
    </div>
  );
};

export default HouseholdDetail;