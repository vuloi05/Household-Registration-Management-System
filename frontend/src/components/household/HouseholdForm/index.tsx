import React, { useEffect } from 'react';
import { Form, Input, DatePicker, Button, Row, Col, Space, message } from 'antd';
import dayjs from 'dayjs';
import { Household, HouseholdFormData } from '@types/household.types';
import { householdService } from '@services/household.service';

interface HouseholdFormProps {
  household?: Household | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const HouseholdForm: React.FC<HouseholdFormProps> = ({
  household,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (household) {
      form.setFieldsValue({
        ...household,
        registrationDate: dayjs(household.registrationDate),
        address: household.address,
      });
    }
  }, [household, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData: HouseholdFormData = {
        ...values,
        registrationDate: values.registrationDate.format('YYYY-MM-DD'),
      };

      if (household) {
        await householdService.update(household.id, formData);
        message.success('Cập nhật hộ khẩu thành công');
      } else {
        await householdService.create(formData);
        message.success('Thêm hộ khẩu thành công');
      }
      onSuccess();
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        registrationDate: dayjs(),
        address: {
          province: 'Hà Nội',
          district: 'Hà Đông',
          ward: 'La Khê',
        },
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="householdCode"
            label="Mã hộ khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mã hộ khẩu' }]}
          >
            <Input placeholder="Nhập mã hộ khẩu" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="householdNumber"
            label="Số hộ khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập số hộ khẩu' }]}
          >
            <Input placeholder="Nhập số hộ khẩu" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={['address', 'houseNumber']}
            label="Số nhà"
            rules={[{ required: true, message: 'Vui lòng nhập số nhà' }]}
          >
            <Input placeholder="Nhập số nhà" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={['address', 'street']}
            label="Đường/Phố"
            rules={[{ required: true, message: 'Vui lòng nhập đường/phố' }]}
          >
            <Input placeholder="Nhập đường/phố" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={['address', 'ward']}
            label="Phường/Xã"
            rules={[{ required: true, message: 'Vui lòng nhập phường/xã' }]}
          >
            <Input placeholder="Nhập phường/xã" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={['address', 'district']}
            label="Quận/Huyện"
            rules={[{ required: true, message: 'Vui lòng nhập quận/huyện' }]}
          >
            <Input placeholder="Nhập quận/huyện" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={['address', 'province']}
            label="Tỉnh/Thành phố"
            rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố' }]}
          >
            <Input placeholder="Nhập tỉnh/thành phố" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="registrationDate"
            label="Ngày đăng ký"
            rules={[{ required: true, message: 'Vui lòng chọn ngày đăng ký' }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {household ? 'Cập nhật' : 'Thêm mới'}
          </Button>
          <Button onClick={onCancel}>Hủy</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default HouseholdForm;