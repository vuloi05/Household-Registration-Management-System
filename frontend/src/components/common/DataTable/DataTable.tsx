import React from 'react';
import { Table, TableProps, Space, Button, Input, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons';
import { PaginationParams } from '../../../types/common.types';
import styles from './DataTable.module.css';

interface DataTableProps<T> extends Omit<TableProps<T>, 'pagination'> {
  headerTitle?: string;
  data: T[];
  pagination?: PaginationParams;
  onSearch?: (value: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onPageChange?: (page: number, pageSize: number) => void;
  searchPlaceholder?: string;
  extra?: React.ReactNode;
}

function DataTable<T extends { id: number | string }>({
  headerTitle,
  data,
  pagination,
  onSearch,
  onRefresh,
  onExport,
  onPageChange,
  searchPlaceholder = 'Tìm kiếm...',
  extra,
  ...tableProps
}: DataTableProps<T>) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>{headerTitle}</div>
        <Space>
          {onSearch && (
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              onChange={(e) => onSearch(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
          )}
          {onRefresh && (
            <Tooltip title="Làm mới">
              <Button icon={<ReloadOutlined />} onClick={onRefresh} />
            </Tooltip>
          )}
          {onExport && (
            <Tooltip title="Xuất Excel">
              <Button icon={<ExportOutlined />} onClick={onExport} />
            </Tooltip>
          )}
          {extra}
        </Space>
      </div>
      <Table<T>
        dataSource={data}
        rowKey="id"
        pagination={
          pagination
            ? {
                current: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng cộng ${total} bản ghi`,
                onChange: onPageChange,
              }
            : false
        }
        {...tableProps}
      />
    </div>
  );
}

export default DataTable;