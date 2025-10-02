import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Button, Space, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import DataTable from '@components/common/DataTable/DataTable';
import HouseholdForm from '@components/household/HouseholdForm';
import HouseholdDetail from '@components/household/HouseholdDetail';
import { householdService } from '@services/household.service';
import { Household } from '@types/household.types';
import { useDebounce } from '@hooks/useDebounce';
import styles from './HouseholdManagement.module.css';

const HouseholdList: React.FC = () => {
  const navigate = useNavigate();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);

  const debouncedSearchText = useDebounce(searchText, 500);

  useEffect(() => {
    fetchHouseholds();
  }, [pagination.page, pagination.pageSize, debouncedSearchText]);

  const fetchHouseholds = async () => {
    setLoading(true);
    try {
      const response = await householdService.getAll({
        page: pagination.page - 1,
        size: pagination.pageSize,
        keyword: debouncedSearchText,
      });
      setHouseholds(response.content);
      setPagination(prev => ({ ...prev, total: response.totalElements }));
    } catch (error) {
      message.error('Không thể tải danh sách hộ khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (household: Household) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa hộ khẩu ${household.householdCode}?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await householdService.delete(household.id);
          message.success('Xóa hộ khẩu thành công');
          fetchHouseholds();
        } catch (error) {
          message.error('Không thể xóa hộ khẩu');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Mã hộ khẩu',
      dataIndex: 'householdCode',
      key: 'householdCode',
      width: 120,
    },
    {
      title: 'Số hộ khẩu',
      dataIndex: 'householdNumber',
      key: 'householdNumber',
      width: 120,
    },
    {
      title: 'Chủ hộ',
      dataIndex: ['headOfHousehold', 'fullName'],
      key: 'headOfHousehold',
      width: 200,
    },
    {
      title: 'Địa chỉ',
      dataIndex: ['address', 'fullAddress'],
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Số nhân khẩu',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 100,
      align: 'center' as const,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          ACTIVE: { text: 'Hoạt động', color: 'green' },
          INACTIVE: { text: 'Không hoạt động', color: 'red' },
        };
        return (
          <span style={{ color: statusMap[status]?.color }}>
            {statusMap[status]?.text}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Household) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/households/${record.id}`)}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setSelectedHousehold(record);
              setShowForm(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <DataTable
        title="Danh sách hộ khẩu"
        data={households}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onSearch={setSearchText}
        onRefresh={fetchHouseholds}
        onPageChange={(page, pageSize) => {
          setPagination(prev => ({ ...prev, page, pageSize }));
        }}
        searchPlaceholder="Tìm theo mã, số hộ khẩu, chủ hộ..."
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedHousehold(null);
              setShowForm(true);
            }}
          >
            Thêm hộ khẩu
          </Button>
        }
      />

      <Modal
        title={selectedHousehold ? 'Cập nhật hộ khẩu' : 'Thêm hộ khẩu mới'}
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
        width={800}
      >
        <HouseholdForm
          household={selectedHousehold}
          onSuccess={() => {
            setShowForm(false);
            fetchHouseholds();
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
};

const HouseholdManagement: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HouseholdList />} />
      <Route path="/:id" element={<HouseholdDetail />} />
    </Routes>
  );
};

export default HouseholdManagement;