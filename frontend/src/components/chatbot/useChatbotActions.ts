import { useEffect, useRef } from 'react';
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
  const statusTimeouts = useRef<Record<string, number>>({});

  const generateMessageId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  const pushStatusMessage = (text: string, status: Message['status'] = 'pending') => {
    const id = generateMessageId();
    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id,
        text,
        sender: 'bot',
        status,
        variant: 'status',
        timestamp,
      },
    ]);
    return id;
  };

  const clearStatusTimeout = (statusId: string) => {
    const timeoutId = statusTimeouts.current[statusId];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete statusTimeouts.current[statusId];
    }
  };

  const updateStatusMessage = (statusId: string, updates: Partial<Message>) => {
    clearStatusTimeout(statusId);
    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== statusId) return msg;
        return {
          ...msg,
          ...updates,
          timestamp,
          variant: 'status',
          status: updates.status ?? msg.status ?? 'success',
        };
      })
    );
  };

  const scheduleStatusAutoComplete = (statusId: string, text: string, delay = 1200) => {
    clearStatusTimeout(statusId);
    statusTimeouts.current[statusId] = window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== statusId || (msg.status && msg.status !== 'pending')) return msg;
          return {
            ...msg,
            text,
            status: 'success',
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            variant: 'status',
          };
        })
      );
      delete statusTimeouts.current[statusId];
    }, delay);
  };

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
    const processedActions: AgentAction[] = [];
    actions.forEach((incomingAct) => {
      const act: AgentAction = { ...incomingAct };
      processedActions.push(act);
      // Điều hướng đề xuất (navigate)
      if (act.type === 'navigate') {
        if (act.target === 'household_list') {
          const statusId = pushStatusMessage('Đang mở trang Quản lý Hộ khẩu...');
          act.statusId = statusId;
          enqueueSnackbar('Agent: Đang mở trang Quản lý Hộ khẩu', { variant: 'info' });
          navigate('/ho-khau');
          scheduleStatusAutoComplete(statusId, '✅ Đã mở trang Quản lý Hộ khẩu!', 900);
        } else if (act.target === 'household_detail' && act.params?.householdId) {
          const statusId = pushStatusMessage(`Đang mở chi tiết hộ khẩu ${act.params.householdId}...`);
          act.statusId = statusId;
          enqueueSnackbar(`Agent: Đang mở chi tiết hộ khẩu ${act.params.householdId}`, { variant: 'info' });
          navigate(`/ho-khau/${encodeURIComponent(act.params.householdId)}`);
          scheduleStatusAutoComplete(statusId, `✅ Đã mở chi tiết hộ khẩu: ${act.params.householdId}`, 1000);
          // Sau khi mở trang, gửi kèm tóm tắt thông tin hộ khẩu
          void pushHouseholdSummary(act.params.householdId);
        } else if (act.target === 'person_list') {
          const statusId = pushStatusMessage('Đang mở trang Quản lý Nhân khẩu...');
          act.statusId = statusId;
          enqueueSnackbar('Agent: Đang mở trang Quản lý Nhân khẩu', { variant: 'info' });
          navigate('/nhan-khau');
          scheduleStatusAutoComplete(statusId, '✅ Đã mở trang Quản lý Nhân khẩu!', 900);
        } else if (act.target === 'person_detail' && act.params?.personId) {
          const statusId = pushStatusMessage(`Đang mở chi tiết nhân khẩu ${act.params.personId}...`);
          act.statusId = statusId;
          enqueueSnackbar(`Agent: Đang mở chi tiết nhân khẩu ${act.params.personId}`, { variant: 'info' });
          navigate('/nhan-khau', { state: { agentAction: act } });
          scheduleStatusAutoComplete(statusId, `✅ Đã mở chi tiết nhân khẩu: ${act.params.personId}`, 1000);
        } else if (act.target === 'fees') {
          const statusId = pushStatusMessage('Đang mở trang Thu phí...');
          act.statusId = statusId;
          enqueueSnackbar('Agent: Đang mở trang Thu phí', { variant: 'info' });
          navigate('/thu-phi');
          scheduleStatusAutoComplete(statusId, '✅ Đã mở trang Quản lý Thu phí!', 900);
        } else if (act.target === 'dashboard') {
          const statusId = pushStatusMessage('Đang mở Dashboard...');
          act.statusId = statusId;
          enqueueSnackbar('Agent: Đang mở Dashboard', { variant: 'info' });
          navigate('/');
          scheduleStatusAutoComplete(statusId, '✅ Đã mở bảng thống kê Dashboard!', 900);
        } else if (act.target === 'login') {
          const statusId = pushStatusMessage('Đang mở trang Đăng nhập...');
          act.statusId = statusId;
          enqueueSnackbar('Agent: Đang mở trang Đăng nhập', { variant: 'info' });
          navigate('/login');
          scheduleStatusAutoComplete(statusId, '✅ Đã chuyển đến trang Đăng nhập!', 900);
        }
      }
      // Tìm kiếm trên danh sách
      if (act.type === 'search' && act.target === 'person_list' && act.params?.q) {
        const statusId = pushStatusMessage('Đang tìm kiếm nhân khẩu, vui lòng chờ...', 'pending');
        act.statusId = statusId;
        scheduleStatusAutoComplete(statusId, `🔎 Đã tìm kiếm nhân khẩu: ${act.params.q}`, 15000);
        navigate('/nhan-khau', { state: { agentAction: act } });
        enqueueSnackbar('Agent: Đang tìm kiếm nhân khẩu: ' + act.params.q, { variant: 'info' });
      }
      if (act.type === 'search' && act.target === 'household_list' && act.params?.q) {
        const statusId = pushStatusMessage('Đang tìm kiếm hộ khẩu, vui lòng chờ...', 'pending');
        act.statusId = statusId;
        // Giảm delay xuống 500ms vì filter là client-side và hoàn thành ngay
        scheduleStatusAutoComplete(statusId, `🔎 Đã tìm kiếm hộ khẩu: ${act.params.q}`, 500);
        navigate('/ho-khau', { state: { agentAction: act } });
        enqueueSnackbar('Agent: Đang tìm kiếm hộ khẩu: ' + act.params.q, { variant: 'info' });
      }
    });
    // Chuyển action vào queue cho page sử dụng nếu cần
    processedActions.forEach(pushAgentAction);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ statusId?: string; text?: string; status?: Message['status'] }>;
      const detail = ce.detail;
      if (!detail?.statusId) return;
      updateStatusMessage(detail.statusId, {
        text: detail.text,
        status: detail.status ?? 'success',
      });
    };
    window.addEventListener('agent-action-status', handler as EventListener);
    return () => window.removeEventListener('agent-action-status', handler as EventListener);
  }, []);

  return {
    pushAgentAction,
    handleAgentActions,
  };
}

