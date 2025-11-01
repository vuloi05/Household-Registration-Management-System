import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import type { AgentAction, Message } from './types';
import { getDanhSachHoKhau } from '../../api/hoKhauApi';
import { getDanhSachNhanKhau, type NhanKhau } from '../../api/nhanKhauApi';

interface UseChatbotActionsParams {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function useChatbotActions({ setMessages }: UseChatbotActionsParams) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const agentActionQueue = useRef<AgentAction[]>([]);

  const pushAgentAction = (action: AgentAction) => {
    agentActionQueue.current.push(action);
    // Có thể phát sự kiện custom ở đây nếu muốn
  };

  const handleAgentActions = (actions: AgentAction[] | undefined) => {
    if (!actions || actions.length === 0) return;
    // Helper để thêm message bot nếu chưa có message này ngay trước đó
    const pushBotMessage = (msg: string) => {
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].text === msg && prev[prev.length - 1].sender === 'bot') return prev;
        return [...prev, { text: msg, sender: 'bot', timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }];
      });
    };
    const pushHouseholdSummary = async (maHoKhau: string) => {
      try {
        const danhSach = await getDanhSachHoKhau();
        const hoKhau = danhSach.find((hk) => hk.maHoKhau === maHoKhau);
        if (!hoKhau) return;
        const members: NhanKhau[] = await getDanhSachNhanKhau(hoKhau.id);
        const memberNames = members.map((m) => m.hoTen).slice(0, 5);
        const moreCount = members.length > 5 ? ` và ${members.length - 5} người khác` : '';
        const summary = [
          `Tóm tắt hộ khẩu ${hoKhau.maHoKhau}:`,
          `- Chủ hộ: ${hoKhau.chuHo?.hoTen || '—'}`,
          `- Địa chỉ: ${hoKhau.diaChi}`,
          `- Ngày lập: ${hoKhau.ngayLap}`,
          `- Số thành viên: ${members.length}`,
          memberNames.length ? `- Thành viên: ${memberNames.join(', ')}${moreCount}` : undefined,
        ]
          .filter(Boolean)
          .join('\n');
        pushBotMessage(summary);
      } catch (err) {
        // Im lặng nếu tóm tắt lỗi, tránh làm phiền người dùng
      }
    };
    actions.forEach((act) => {
      // Điều hướng đề xuất (navigate)
      if (act.type === 'navigate') {
        if (act.target === 'household_list') {
          enqueueSnackbar('Agent: Đang mở trang Quản lý Hộ khẩu', { variant: 'info' });
          navigate('/ho-khau');
          pushBotMessage('✅ Đã mở trang Quản lý Hộ khẩu!');
        } else if (act.target === 'household_detail' && act.params?.householdId) {
          enqueueSnackbar(`Agent: Đang mở chi tiết hộ khẩu ${act.params.householdId}`, { variant: 'info' });
          navigate(`/ho-khau/${encodeURIComponent(act.params.householdId)}`);
          pushBotMessage(`✅ Đã mở chi tiết hộ khẩu: ${act.params.householdId}`);
          // Sau khi mở trang, gửi kèm tóm tắt thông tin hộ khẩu
          void pushHouseholdSummary(act.params.householdId);
        } else if (act.target === 'person_list') {
          enqueueSnackbar('Agent: Đang mở trang Quản lý Nhân khẩu', { variant: 'info' });
          navigate('/nhan-khau');
          pushBotMessage('✅ Đã mở trang Quản lý Nhân khẩu!');
        } else if (act.target === 'person_detail' && act.params?.personId) {
          enqueueSnackbar(`Agent: Đang mở chi tiết nhân khẩu ${act.params.personId}`, { variant: 'info' });
          navigate('/nhan-khau', { state: { agentAction: act } });
          pushBotMessage(`✅ Đã mở chi tiết nhân khẩu: ${act.params.personId}`);
        } else if (act.target === 'fees') {
          enqueueSnackbar('Agent: Đang mở trang Thu phí', { variant: 'info' });
          navigate('/thu-phi');
          pushBotMessage('✅ Đã mở trang Quản lý Thu phí!');
        } else if (act.target === 'dashboard') {
          enqueueSnackbar('Agent: Đang mở Dashboard', { variant: 'info' });
          navigate('/');
          pushBotMessage('✅ Đã mở bảng thống kê Dashboard!');
        } else if (act.target === 'login') {
          enqueueSnackbar('Agent: Đang mở trang Đăng nhập', { variant: 'info' });
          navigate('/login');
          pushBotMessage('✅ Đã chuyển đến trang Đăng nhập!');
        }
      }
      // Tìm kiếm trên danh sách
      if (act.type === 'search' && act.target === 'person_list' && act.params?.q) {
        navigate('/nhan-khau', { state: { agentAction: act } });
        enqueueSnackbar('Agent: Đang tìm kiếm nhân khẩu: ' + act.params.q, { variant: 'info' });
        pushBotMessage('🔎 Đã tìm kiếm nhân khẩu: ' + act.params.q);
      }
      if (act.type === 'search' && act.target === 'household_list' && act.params?.q) {
        navigate('/ho-khau', { state: { agentAction: act } });
        enqueueSnackbar('Agent: Đang tìm kiếm hộ khẩu: ' + act.params.q, { variant: 'info' });
        pushBotMessage('🔎 Đã tìm kiếm hộ khẩu: ' + act.params.q);
      }
    });
    // Chuyển action vào queue cho page sử dụng nếu cần
    actions.forEach(pushAgentAction);
  };

  return {
    pushAgentAction,
    handleAgentActions,
  };
}

