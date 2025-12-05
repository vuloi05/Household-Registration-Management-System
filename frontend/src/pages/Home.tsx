import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Paper,
} from '@mui/material';
import {
  Build as BuildIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import heroImage from '../image/anh.jpg';

const HomePage = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header/Navigation */}
      <AppBar position="sticky" sx={{ bgcolor: '#c62828', boxShadow: 3 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Quản lý chung cư
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button color="inherit" onClick={() => scrollToSection('home')}>
              Trang chủ
            </Button>
            <Button color="inherit" onClick={() => scrollToSection('services')}>
              Dịch vụ
            </Button>
            <Button color="inherit" onClick={() => scrollToSection('references')}>
              Tài liệu tham khảo
            </Button>
            <Button color="inherit" onClick={() => scrollToSection('about')}>
              Về chúng tôi
            </Button>
            <Button color="inherit" onClick={() => scrollToSection('contact')}>
              Liên hệ
            </Button>
          </Box>

          <Button 
            variant="contained" 
            color="secondary"
            href="/login"
            sx={{ 
              bgcolor: '#ffd54f', 
              color: '#c62828',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#ffecb3' }
            }}
          >
            Đăng nhập
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        id="home"
        sx={{
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'white',
          py: 8,
          // Overlay để text dễ đọc hơn
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(198, 40, 40, 0.3)', // Overlay đỏ mờ 30%
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
              alignItems: 'center',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
                Chào mừng đến với Quản lý Chung cư
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Hệ thống Quản lý Hộ khẩu và Cư dân
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem' }}>
                Giải pháp hiện đại và hiệu quả cho việc quản lý hộ khẩu,
                cư dân và các dịch vụ hành chính trong cộng đồng.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: '#ffd54f',
                    color: '#c62828',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: '#ffecb3' },
                  }}
                  onClick={() => scrollToSection('services')}
                >
                  Khám phá Dịch vụ
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: '#f0f0f0', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                  onClick={() => scrollToSection('contact')}
                >
                  Bắt đầu
                </Button>
              </Box>
            </Box>

          </Box>
        </Container>
      </Box>

      {/* Our Services Section */}
      <Box id="services" sx={{ py: 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}
          >
            Dịch vụ của chúng tôi
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{ mb: 6, color: '#666', fontSize: '1.1rem' }}
          >
            Giải pháp toàn diện cho quản lý chung cư hiện đại
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 4,
            }}
          >
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-10px)', boxShadow: 6 },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <PeopleIcon sx={{ fontSize: 80, color: '#d32f2f', mb: 2 }} />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Quản lý Hộ khẩu
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quản lý hiệu quả thông tin hộ khẩu, đăng ký và cập nhật
                  với nền tảng số hóa tinh gọn của chúng tôi.
                </Typography>
              </CardContent>
            </Card>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-10px)', boxShadow: 6 },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <BuildIcon sx={{ fontSize: 80, color: '#c62828', mb: 2 }} />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Quản lý Thu phí
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Theo dõi, thu và quản lý các khoản phí với
                  thông báo tự động và báo cáo chi tiết.
                </Typography>
              </CardContent>
            </Card>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-10px)', boxShadow: 6 },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <BusinessIcon sx={{ fontSize: 80, color: '#e64a19', mb: 2 }} />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Công cụ Quản trị
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bảng điều khiển quản trị toàn diện với phân tích, báo cáo,
                  và khả năng quản lý cư dân.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* Client Success Stories */}
      <Box id="references" sx={{ py: 10, bgcolor: '#f5f5f5' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}
          >
            Câu chuyện thành công
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{ mb: 6, color: '#666', fontSize: '1.1rem' }}
          >
            Được tin dùng bởi các cộng đồng trên toàn quốc
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 4,
            }}
          >
            <Paper sx={{ p: 4, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Văn phòng Quản lý Quận
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                "Hệ thống đã thay đổi hoàn toàn quy trình đăng ký hộ khẩu của chúng tôi. 
                Những công việc trước đây mất hàng ngày giờ chỉ cần vài phút. 
                Hệ thống trực quan và nhân viên thích nghi rất nhanh."
              </Typography>
              <Typography variant="caption" color="primary">
                — Giám đốc Hành chính, TP. Hà Nội
              </Typography>
            </Paper>
            <Paper sx={{ p: 4, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Ban Quản lý Cộng đồng
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                "Mô-đun quản lý phí đã cách mạng hóa cách chúng tôi thu và theo dõi
                thanh toán. Tính minh bạch tăng lên và tranh chấp giảm
                đáng kể."
              </Typography>
              <Typography variant="caption" color="primary">
                — Chủ tịch Ban Quản lý, TP. Hồ Chí Minh
              </Typography>
            </Paper>
            <Paper sx={{ p: 4, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Chính quyền Thành phố
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                "Tính năng phân tích và báo cáo cung cấp những hiểu biết vô giá về
                xu hướng nhân khẩu học. Dữ liệu này định hướng các quyết định quy hoạch đô thị của chúng tôi."
              </Typography>
              <Typography variant="caption" color="primary">
                — Chuyên viên Quy hoạch Thành phố Đà Nẵng
              </Typography>
            </Paper>
            <Paper sx={{ p: 4, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Văn phòng Phường
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                "Sự hài lòng của người dân đã cải thiện đáng kể. Hệ thống nhanh chóng,
                đáng tin cậy và đã giảm hơn 80% khối lượng giấy tờ."
              </Typography>
              <Typography variant="caption" color="primary">
                — Trưởng Phường, Tỉnh Cần Thơ
              </Typography>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* About Pyramidon Section */}
      <Box id="about" sx={{ py: 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 6,
              alignItems: 'center',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
                Về chúng tôi
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#666', lineHeight: 1.8 }}>
                Chúng tôi là nhà cung cấp hàng đầu các giải pháp chuyển đổi số cho
                quản lý công. Với nhiều năm kinh nghiệm trong hệ thống đăng ký hộ khẩu
                và quản lý cư dân, chúng tôi hiểu rõ những thách thức độc đáo mà
                các cơ quan chính quyền phải đối mặt.
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#666', lineHeight: 1.8 }}>
                Sứ mệnh của chúng tôi là hiện đại hóa quy trình hành chính, giảm quan liêu,
                và nâng cao sự hài lòng của người dân thông qua các giải pháp công nghệ sáng tạo.
                Chúng tôi kết hợp phần mềm tiên tiến với thiết kế trực quan để tạo ra hệ thống
                vừa mạnh mẽ vừa dễ sử dụng.
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#666', lineHeight: 1.8 }}>
                Được tin dùng bởi các cơ quan chính quyền trên toàn quốc, chúng tôi tiếp tục
                đặt ra tiêu chuẩn xuất sắc cho dịch vụ số trong khu vực công.
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 3,
                }}
              >
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                    500+
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Khách hàng
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                    1M+
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hộ khẩu đăng ký
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                    99.9%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thời gian hoạt động
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                    24/7
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hỗ trợ
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Get In Touch Section */}
      <Box
        id="contact"
        sx={{
          py: 10,
          background: 'linear-gradient(135deg, #c62828 0%, #8e0000 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{ mb: 2, fontWeight: 'bold' }}
          >
            Liên hệ với chúng tôi
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{ mb: 6, fontSize: '1.1rem', opacity: 0.9 }}
          >
            Có thắc mắc? Chúng tôi rất muốn được nghe từ bạn.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 6,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Gửi tin nhắn cho chúng tôi
                </Typography>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField fullWidth label="Họ và tên" variant="outlined" />
                  <TextField fullWidth label="Địa chỉ Email" variant="outlined" type="email" />
                  <TextField fullWidth label="Tiêu đề" variant="outlined" />
                  <TextField
                    fullWidth
                    label="Nội dung"
                    variant="outlined"
                    multiline
                    rows={4}
                  />
                  <Button variant="contained" size="large" sx={{ mt: 2 }}>
                    Gửi tin nhắn
                  </Button>
                </Box>
              </Paper>
            </Box>
            <Box sx={{ flex: 1, color: 'white' }}>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>
                Thông tin liên hệ
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmailIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                      Email
                    </Typography>
                    <Typography variant="body1">lienhe@quanlychungcu.vn</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PhoneIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                      Điện thoại
                    </Typography>
                    <Typography variant="body1">+84 (024) 1234 5678</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOnIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                      Địa chỉ
                    </Typography>
                    <Typography variant="body1">
                      123 Đường Lê Duẩn, Hà Nội, Việt Nam
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ mt: 6 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Giờ làm việc
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Thứ Hai - Thứ Sáu: 8:00 - 18:00
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Thứ Bảy: 9:00 - 13:00
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Chủ Nhật: Nghỉ
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a1a1a', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © 2025 Hệ thống Quản lý Chung cư. Bảo lưu mọi quyền.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
