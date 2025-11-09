import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount, setDefaultBankAccount, type BankAccount } from '../api/bankAccountApi';
import { appTheme } from '../theme';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const BANK_LIST = [
  { name: 'Vietcombank', code: 'VCB' },
  { name: 'BIDV', code: 'BIDV' },
  { name: 'VietinBank', code: 'CTG' },
  { name: 'Agribank', code: 'VBA' },
  { name: 'Techcombank', code: 'TCB' },
  { name: 'ACB', code: 'ACB' },
  { name: 'TPBank', code: 'TPB' },
  { name: 'MBBank', code: 'MBB' },
  { name: 'VPBank', code: 'VPB' },
  { name: 'Sacombank', code: 'STB' },
];

// Hàm loại bỏ dấu tiếng Việt và chuyển thành chữ in hoa
const removeVietnameseAccents = (str: string): string => {
  const accents: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
    'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
    'Đ': 'D',
  };

  return str
    .split('')
    .map((char) => accents[char] || char)
    .join('')
    .toUpperCase();
};

export default function BankAccountScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  
  // Form state
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Chỉ load khi user đã được xác thực
    if (user) {
      loadBankAccounts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      setErrorMessage(null); // Clear error message khi bắt đầu load
      const accounts = await getBankAccounts();
      setBankAccounts(accounts);
    } catch (error: any) {
      // Kiểm tra loại lỗi
      if (error.response?.status === 403 || error.status === 403) {
        // Lỗi 403: Không có quyền truy cập
        console.error('403 Forbidden - User may not have permission:', error);
        
        // Nếu error đã được xử lý bởi axiosClient interceptor (có flag isHandled)
        if (error.isHandled) {
          // Không hiển thị alert, chỉ set error message để hiển thị trên UI
          setErrorMessage(error.userMessage || 'Bạn không có quyền truy cập tính năng này');
        } else {
          // Error chưa được xử lý, hiển thị error message
          const message = error.userMessage || error.message || 'Bạn không có quyền truy cập tính năng này';
          setErrorMessage(message);
        }
      } else if (error.response?.status === 401 || error.status === 401) {
        // Lỗi 401: Chưa đăng nhập hoặc token hết hạn
        // axiosClient interceptor sẽ xử lý refresh token
        console.error('401 Unauthorized:', error);
        // Không hiển thị alert, để axiosClient interceptor xử lý
        // Nếu refresh token thất bại, sẽ có error khác được throw
        setErrorMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        // Các lỗi khác
        const message = error.message || 'Không thể tải danh sách tài khoản ngân hàng';
        // Chỉ hiển thị alert cho các lỗi không phải là network error đã được xử lý
        if (message.includes('kết nối') || message.includes('Network')) {
          setErrorMessage(message);
        } else {
          // Hiển thị alert cho các lỗi khác
          Alert.alert('Lỗi', message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBankSelect = (bank: { name: string; code: string }) => {
    setBankName(bank.name);
    setBankCode(bank.code);
    setIsBankDropdownOpen(false);
  };

  const getSelectedBankName = () => {
    return bankName || 'Chọn ngân hàng';
  };

  const openAddModal = () => {
    setEditingAccount(null);
    setAccountNumber('');
    setAccountName('');
    setBankName('');
    setBankCode('');
    setBranchName('');
    setIsDefault(false);
    setIsBankDropdownOpen(false);
    setIsModalVisible(true);
  };

  const openEditModal = (account: BankAccount) => {
    setEditingAccount(account);
    setAccountNumber(account.accountNumber);
    setAccountName(account.accountName);
    setBankName(account.bankName);
    setBankCode(account.bankCode || '');
    setBranchName(account.branchName || '');
    setIsDefault(account.isDefault || false);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setIsBankDropdownOpen(false);
    setEditingAccount(null);
  };

  const validateForm = () => {
    if (!accountNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tài khoản');
      return false;
    }
    if (!accountName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên chủ tài khoản');
      return false;
    }
    if (!bankName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng chọn ngân hàng');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const data = {
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        bankName: bankName.trim(),
        bankCode: bankCode.trim() || undefined,
        branchName: branchName.trim() || undefined,
        isDefault,
      };

      if (editingAccount) {
        await updateBankAccount(editingAccount.id, data);
        Alert.alert('Thành công', 'Cập nhật tài khoản ngân hàng thành công');
      } else {
        await createBankAccount(data);
        Alert.alert('Thành công', 'Thêm tài khoản ngân hàng thành công');
      }

      closeModal();
      loadBankAccounts();
    } catch (error: any) {
      // Lấy message từ backend nếu có
      let errorMessage = 'Không thể lưu tài khoản ngân hàng';
      
      if (error.response?.data?.error) {
        // Backend trả về {error: "message"}
        errorMessage = error.response.data.error;
      } else if (error.message) {
        // Fallback về error.message
        errorMessage = error.message;
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (account: BankAccount) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBankAccount(account.id);
              Alert.alert('Thành công', 'Xóa tài khoản ngân hàng thành công');
              loadBankAccounts();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa tài khoản ngân hàng');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (account: BankAccount) => {
    try {
      await setDefaultBankAccount(account.id);
      Alert.alert('Thành công', 'Đặt tài khoản mặc định thành công');
      loadBankAccounts();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đặt tài khoản mặc định');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={appTheme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tài khoản ngân hàng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#D32F2F" />
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadBankAccounts}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : bankAccounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bank-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>Chưa có tài khoản ngân hàng</Text>
            <Text style={styles.emptySubText}>Thêm tài khoản để sử dụng thanh toán</Text>
          </View>
        ) : (
          bankAccounts.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={styles.accountHeader}>
                <View style={styles.accountInfo}>
                  <Text style={styles.bankName}>{account.bankName}</Text>
                  {account.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Mặc định</Text>
                    </View>
                  )}
                </View>
                <View style={styles.accountActions}>
                  {!account.isDefault && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(account)}
                    >
                      <MaterialCommunityIcons name="star-outline" size={20} color={appTheme.colors.primary} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(account)}
                  >
                    <MaterialCommunityIcons name="pencil" size={20} color={appTheme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(account)}
                  >
                    <MaterialCommunityIcons name="delete-outline" size={20} color="#D32F2F" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.accountNumber}>{account.accountNumber}</Text>
              <Text style={styles.accountName}>{account.accountName}</Text>
              {account.branchName && (
                <Text style={styles.branchName}>{account.branchName}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Thêm tài khoản</Text>
      </TouchableOpacity>

      {/* Modal Form */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAccount ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản ngân hàng'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <MaterialCommunityIcons name="close" size={24} color="#212121" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Số tài khoản *</Text>
                <TextInput
                  style={styles.input}
                  value={accountNumber}
                  onChangeText={(text) => {
                    // Chỉ cho phép nhập số
                    const numericText = text.replace(/[^0-9]/g, '');
                    setAccountNumber(numericText);
                  }}
                  placeholder="Nhập số tài khoản"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Tên chủ tài khoản *</Text>
                <TextInput
                  style={styles.input}
                  value={accountName}
                  onChangeText={(text) => {
                    const processedText = removeVietnameseAccents(text);
                    setAccountName(processedText);
                  }}
                  placeholder="Nhập tên chủ tài khoản"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Ngân hàng *</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                >
                  <Text style={[styles.dropdownButtonText, !bankName && styles.dropdownPlaceholder]}>
                    {getSelectedBankName()}
                  </Text>
                  <MaterialCommunityIcons
                    name={isBankDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="#757575"
                  />
                </TouchableOpacity>
                {isBankDropdownOpen && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled>
                      {BANK_LIST.map((bank) => (
                        <TouchableOpacity
                          key={bank.code}
                          style={[
                            styles.dropdownItem,
                            bankName === bank.name && styles.dropdownItemSelected,
                          ]}
                          onPress={() => handleBankSelect(bank)}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              bankName === bank.name && styles.dropdownItemTextSelected,
                            ]}
                          >
                            {bank.name}
                          </Text>
                          {bankName === bank.name && (
                            <MaterialCommunityIcons
                              name="check"
                              size={20}
                              color={appTheme.colors.primary}
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Chi nhánh</Text>
                <TextInput
                  style={styles.input}
                  value={branchName}
                  onChangeText={setBranchName}
                  placeholder="Nhập tên chi nhánh (tùy chọn)"
                />
              </View>

              <View style={styles.formGroup}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setIsDefault(!isDefault)}
                >
                  <MaterialCommunityIcons
                    name={isDefault ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={24}
                    color={isDefault ? appTheme.colors.primary : '#757575'}
                  />
                  <Text style={styles.checkboxLabel}>Đặt làm tài khoản mặc định</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9E9E9E',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  accountInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  bankName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  accountActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  accountNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  accountName: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  branchName: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appTheme.colors.primary,
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  modalBody: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
    backgroundColor: '#FAFAFA',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
    minHeight: 48,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#212121',
  },
  dropdownPlaceholder: {
    color: '#9E9E9E',
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dropdownItemSelected: {
    backgroundColor: '#FFF5F5',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#212121',
  },
  dropdownItemTextSelected: {
    color: appTheme.colors.primary,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#424242',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
  },
  saveButton: {
    backgroundColor: appTheme.colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

