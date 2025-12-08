// src/hooks/useNhanKhauAgent.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import type { NhanKhau } from '../api/nhanKhauApi';

interface UseNhanKhauAgentProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  setSearchInputValue: (value: string) => string;
  setPage: (page: number) => void;
  nhanKhauList: NhanKhau[];
  loading: boolean;
  lastDataLoadedAt: number;
  setLastDataLoadedAt: (timestamp: number) => void;
  handleViewDetail: (nhanKhau: NhanKhau) => void;
  setSelectedNhanKhau: (nhanKhau: NhanKhau | null) => void;
  setDetailOpen: (open: boolean) => void;
}

export function useNhanKhauAgent({
  searchQuery,
  setSearchQuery,
  setSearchInputValue,
  setPage,
  nhanKhauList,
  loading,
  lastDataLoadedAt,
  handleViewDetail,
  setSelectedNhanKhau,
  setDetailOpen,
}: UseNhanKhauAgentProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [pendingAgentSearch, setPendingAgentSearch] = useState<{ query: string; triggeredAt: number; statusId?: string } | null>(null);
  const [pendingAgentDetailId, setPendingAgentDetailId] = useState<string | null>(null);
  const searchQueryRef = useRef('');
  const [isAgentTypingSearch, setIsAgentTypingSearch] = useState(false);
  const agentTypingTimeoutRef = useRef<number | null>(null);

  const updateSearchValue = useCallback((
    value: string,
    options: { commit?: boolean; resetPage?: boolean } = {}
  ) => {
    const { commit = true, resetPage = true } = options;
    setSearchInputValue(value);
    if (commit) {
      setSearchQuery(value);
      if (resetPage) setPage(0);
    }
  }, [setSearchInputValue, setSearchQuery, setPage]);

  const simulateSearchTyping = useCallback((text: string, statusId?: string) => {
    if (!text) return;
    if (agentTypingTimeoutRef.current) {
      window.clearTimeout(agentTypingTimeoutRef.current);
    }
    setIsAgentTypingSearch(true);
    updateSearchValue('', { commit: false, resetPage: false });
    let index = 0;
    const typeNext = () => {
      const partial = text.slice(0, index + 1);
      updateSearchValue(partial, { commit: false, resetPage: false });
      index++;
      if (index < text.length) {
        agentTypingTimeoutRef.current = window.setTimeout(typeNext, 65);
      } else {
        setIsAgentTypingSearch(false);
        updateSearchValue(text, { commit: true, resetPage: true });
        setPendingAgentSearch({ query: text, triggeredAt: Date.now(), statusId });
      }
    };
    typeNext();
  }, [updateSearchValue]);

  // Nhận QR từ AppSheet -> chỉ lấy số CCCD (trường đầu tiên trước ký tự '|') để tìm kiếm
  const handleReceiveQRCode = useCallback((qr: string) => {
    const parts = (qr || '').split('|').map(p => p.trim());
    const cccd = parts[0] || qr;
    updateSearchValue(cccd);
    enqueueSnackbar('Đã điền CCCD từ QR vào ô tìm kiếm', { variant: 'success' });
  }, [updateSearchValue, enqueueSnackbar]);

  // Lắng nghe agent action sau khi điều hướng
  useEffect(() => {
    const s = location.state as { agentAction?: { type: string; target: string; params?: { q?: string; personId?: string }; statusId?: string } } | null;
    if (!s || !s.agentAction) return;
    const act = s.agentAction;
    if (act.type === 'search' && act.target === 'person_list' && act.params?.q) {
      const query = String(act.params.q).trim();
      if (query) {
        let finalQuery = query;
        const currentQuery = searchQueryRef.current.trim();
        const addressKeywords = ['biệt thự', 'biet thu', 'thự', 'phố', 'đường', 'duong', 'xã', 'phường', 'quận', 'huyện', 'tỉnh', 'thành phố', 'the vesta', 'ấp', 'thôn', 'ngõ', 'ngõ', 'ngách'];
        const isAddress = addressKeywords.some(kw => query.toLowerCase().includes(kw));
        if (isAddress && currentQuery && !query.toLowerCase().includes(currentQuery.toLowerCase())) {
          finalQuery = `${currentQuery} ${query}`.trim();
        }
        setPendingAgentSearch(null);
        enqueueSnackbar('Agent: Đang tìm kiếm nhân khẩu: ' + finalQuery, { variant: 'info' });
        simulateSearchTyping(finalQuery, act.statusId);
        setPendingAgentDetailId(null);
      }
    }
    if (act.type === 'search' && act.target === 'person_list' && !act.params?.q) {
      setPendingAgentSearch(null);
    }
    if (act.type === 'navigate' && act.target === 'person_detail' && act.params?.personId) {
      setPendingAgentDetailId(String(act.params.personId));
    }
    navigate(location.pathname, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, simulateSearchTyping, enqueueSnackbar, navigate]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (agentTypingTimeoutRef.current) {
        window.clearTimeout(agentTypingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!pendingAgentSearch) return;
    if (loading) return;
    if (lastDataLoadedAt < pendingAgentSearch.triggeredAt) return;
    const { query, statusId } = pendingAgentSearch;

    const notifySearchStatus = (text?: string) => {
      if (!statusId) return;
      window.dispatchEvent(
        new CustomEvent('agent-action-status', {
          detail: {
            statusId,
            text: text || `🔎 Đã tìm kiếm nhân khẩu: ${query}`,
            status: 'success',
          },
        })
      );
    };

    if (nhanKhauList.length === 0) {
      notifySearchStatus();
      window.dispatchEvent(new CustomEvent('agent-bot-message', {
        detail: `Không tìm thấy nhân khẩu phù hợp với từ khóa "${query}". Vui lòng cung cấp CCCD, mã hộ khẩu hoặc địa chỉ cụ thể hơn.`,
      }));
      setPendingAgentSearch(null);
      return;
    }
    if (nhanKhauList.length === 1) {
      notifySearchStatus();
      const only = nhanKhauList[0];
      handleViewDetail(only);
      window.dispatchEvent(new CustomEvent('agent-bot-message', {
        detail: `Hiện tại đang có 1 người tên là ${query}. Đang mở chi tiết hồ sơ cho bạn.`,
      }));
      setPendingAgentSearch(null);
      setPendingAgentDetailId(null);
      return;
    }
    const normalized = query.toLowerCase();
    const sameNameCount = nhanKhauList.filter(nk => (nk.hoTen || '').toLowerCase() === normalized).length;
    const totalDisplay = sameNameCount > 0 ? sameNameCount : nhanKhauList.length;
    const detailMessage = totalDisplay >= 2
      ? `Hiện tại đang có ${totalDisplay} người tên là ${query}. Bạn muốn tìm người nào? Vui lòng cung cấp thêm CCCD, mã hộ khẩu hoặc địa chỉ.`
      : `Hiện tại đang có ${totalDisplay} người tên là ${query}.`;
    notifySearchStatus();
    window.dispatchEvent(new CustomEvent('agent-bot-message', { detail: detailMessage }));
    setPendingAgentSearch(null);
  }, [pendingAgentSearch, loading, nhanKhauList, handleViewDetail, lastDataLoadedAt]);

  useEffect(() => {
    if (!pendingAgentDetailId || loading) return;
    const nk = nhanKhauList.find(
      item =>
        item.cmndCccd === pendingAgentDetailId ||
        String(item.id) === pendingAgentDetailId
    );
    if (nk) {
      setSelectedNhanKhau(nk);
      setDetailOpen(true);
      enqueueSnackbar('Agent: Đang mở chi tiết nhân khẩu: ' + nk.hoTen, { variant: 'info' });
      setPendingAgentDetailId(null);
    } else if (!loading) {
      enqueueSnackbar('Agent: Không tìm thấy nhân khẩu trong danh sách hiện tại', { variant: 'warning' });
      setPendingAgentDetailId(null);
    }
  }, [pendingAgentDetailId, nhanKhauList, loading, enqueueSnackbar, setSelectedNhanKhau, setDetailOpen]);

  return {
    isAgentTypingSearch,
    handleReceiveQRCode,
  };
}

