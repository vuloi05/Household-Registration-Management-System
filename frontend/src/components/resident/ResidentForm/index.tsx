import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Row, Col, Space, message } from 'antd';
import dayjs from 'dayjs';
import { Resident, ResidentFormData } from '@types/resident.types';
import { Gender } from '@types/common.types';
import { residentService } from '@services/resident.service';

interface ResidentFormProps {
  resident?: Resident | null;
  householdId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const ResidentForm: React.FC<ResidentFormProps> = ({
  resident,
  householdId,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (resident) {
      form.setFieldsValue({
        ...resident,
        dateOfBirth: dayjs(resident.dateOfBirth),
        permanentRegistrationDate: dayjs(resident.permanentRegistrationDate),
        identityCard: {
          ...resident.identityCard,
          issueDate: resident.identityCard?.issueDate 
            ? dayjs(resident.identityCard.issueDate) 
            : undefined,
        },
      });
    } else if (householdId) {
      form.setFieldValue('householdId', householdId);
    }
  }, [resident, householdId, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData: ResidentFormData = {
        ...values,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        permanentRegistrationDate: values.permanentRegistrationDate.format('YYYY-MM-DD'),
        identityCard: values.identityCard?.number ? {
          ...values.identityCard,
          issueDate: values.identityCard.issueDate?.format('YYYY-MM-DD'),
        } : undefined,
      };

      if (resident) {
        await residentService.update(resident.id, formData);
        message.success('Cập nhật nhân khẩu thành công');
      } else {
        await residentService.create(formData);
        message.success('Thêm nhân khẩu thành công');
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
        gender: Gender.MALE,
        ethnicity: 'Kinh',
        permanentRegistrationDate: dayjs(),
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="alias" label="Bí danh">
            <Input placeholder="Nhập bí danh (nếu có)" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
          >
            <Select>
              <Select.Option value={Gender.MALE}>Nam</Select.Option>
              <Select.Option value={Gender.FEMALE}>Nữ</Select.Option>
              <Select.Option value={Gender.OTHER}>Khác</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="ethnicity"
            label="Dân tộc"
            rules={[{ required: true, message: 'Vui lòng nhập dân tộc' }]}
          >
            <Input placeholder="Nhập dân tộc" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="placeOfBirth"
            label="Nơi sinh"
            rules={[{ required: true, message: 'Vui lòng nhập nơi sinh' }]}
          >
            <Input placeholder="Nhập nơi sinh" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="hometown"
            label="Nguyên quán"
            rules={[{ required: true, message: 'Vui lòng nhập nguyên quán' }]}
          >
            <Input placeholder="Nhập nguyên quán" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="occupation" label="Nghề nghiệp">
            <Input placeholder="Nhập nghề nghiệp" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="workplace" label="Nơi làm việc">
            <Input placeholder="Nhập nơi làm việc" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={['identityCard', 'type']}
            label="Loại giấy tờ"
          >
            <Select>
              <Select.Option value="CMND">CMND</Select.Option>
              <Select.Option value="CCCD">CCCD</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={['identityCard', 'number']}
            label="Số CMND/CCCD"
          >
            <Input placeholder="Nhập số CMND/CCCD" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={['identityCard', 'issueDate']}
            label="Ngày cấp"
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={['identityCard', 'issuePlace']}
            label="Nơi cấp"
          >
            <Input placeholder="Nhập nơi cấp" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="relationshipWithHead"
            label="Quan hệ với chủ hộ"
            rules={[{ required: true, message: 'Vui lòng nhập quan hệ với chủ hộ' }]}
          >
            <Input placeholder="VD: Con, Vợ, Chồng..." />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="permanentRegistrationDate"
            label="Ngày đăng ký thường trú"
            rules={[{ required: true, message: 'Vui lòng chọn ngày đăng ký' }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="previousAddress" label="Địa chỉ trước khi chuyển đến">
            <Input placeholder="Nhập địa chỉ cũ" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="householdId" hidden>
        <Input />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {resident ? 'Cập nhật' : 'Thêm mới'}
          </Button>
          <Button onClick={onCancel}>Hủy</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ResidentForm;