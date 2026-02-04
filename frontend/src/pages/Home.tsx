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
  IconButton,
  Fade,
  useScrollTrigger,
} from '@mui/material';
import {
  Build as BuildIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher';
import heroImage from '../image/anh.jpg';

// Scroll to top button component
const ScrollTop = () => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000,
        }}
      >
        <IconButton
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: 4,
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'translateY(-4px)',
              boxShadow: 6,
            },
            transition: 'all 0.3s ease',
          }}
        >
          <KeyboardArrowUpIcon />
        </IconButton>
      </Box>
    </Fade>
  );
};

const HomePage = () => {
  const { t } = useTranslation('home');
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header/Navigation */}
      <AppBar 
        position="sticky" 
        sx={{ 
          bgcolor: '#c62828', 
          boxShadow: 3,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}>
              {t('title')}
            </Typography>
          </motion.div>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            {['home', 'services', 'references', 'about', 'contact'].map((section, index) => (
              <motion.div
                key={section}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Button 
                  color="inherit" 
                  onClick={() => scrollToSection(section)}
                  sx={{
                    px: 2,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {t(`nav.${section}`)}
                </Button>
              </motion.div>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <LanguageSwitcher />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="contained" 
                color="secondary"
                href="/login"
                sx={{ 
                  bgcolor: '#ffd54f', 
                  color: '#c62828',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  px: 3,
                  boxShadow: 2,
                  '&:hover': { 
                    bgcolor: '#ffecb3',
                    boxShadow: 4,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {t('nav.login')}
              </Button>
            </motion.div>
          </Box>
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
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ flex: 1 }}
            >
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 3,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  fontSize: { xs: '2rem', md: '3rem' },
                }}
              >
                {t('hero.title')}
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.95,
                  textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                }}
              >
                {t('hero.subtitle')}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4, 
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  maxWidth: '600px',
                }}
              >
                {t('hero.description')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: '#ffd54f',
                      color: '#c62828',
                      fontWeight: 'bold',
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      boxShadow: 4,
                      '&:hover': { 
                        bgcolor: '#ffecb3',
                        boxShadow: 6,
                      },
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => scrollToSection('services')}
                  >
                    {t('hero.explore_services')}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      borderWidth: 2,
                      color: 'white',
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      backdropFilter: 'blur(5px)',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { 
                        borderColor: '#f0f0f0', 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        borderWidth: 2,
                      },
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => scrollToSection('contact')}
                  >
                    {t('hero.get_started')}
                  </Button>
                </motion.div>
              </Box>
            </motion.div>

          </Box>
        </Container>
      </Box>

      {/* Our Services Section */}
      <Box id="services" sx={{ py: 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h3"
              align="center"
              sx={{ 
                mb: 2, 
                fontWeight: 'bold', 
                color: '#333',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 4,
                  bgcolor: 'primary.main',
                  borderRadius: 2,
                },
                pb: 2,
              }}
            >
              {t('services.title')}
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{ mb: 6, color: '#666', fontSize: '1.1rem' }}
            >
              {t('services.subtitle')}
            </Typography>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 4,
              }}
            >
              {[
                { icon: PeopleIcon, color: '#d32f2f', key: 'household_management' },
                { icon: BuildIcon, color: '#c62828', key: 'fee_management' },
                { icon: BusinessIcon, color: '#e64a19', key: 'admin_tools' },
              ].map((service, index) => (
                <motion.div
                  key={service.key}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'visible',
                      '&:hover': { 
                        transform: 'translateY(-12px)',
                        boxShadow: 8,
                        '& .service-icon': {
                          transform: 'scale(1.1) rotate(5deg)',
                        },
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        bgcolor: service.color,
                        borderRadius: '12px 12px 0 0',
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Box
                        className="service-icon"
                        sx={{
                          transition: 'all 0.3s ease',
                          display: 'inline-block',
                        }}
                      >
                        <service.icon sx={{ fontSize: 80, color: service.color, mb: 2 }} />
                      </Box>
                      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                        {t(`services.${service.key}.title`)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {t(`services.${service.key}.description`)}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Client Success Stories */}
      <Box id="references" sx={{ py: 10, bgcolor: '#f5f5f5' }}>
        <Container maxWidth="lg">
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
            {t('services.title')}
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{ mb: 6, color: '#666', fontSize: '1.1rem' }}
          >
            {t('services.subtitle')}
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
                  {t('services.household_management.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('services.household_management.description')}
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
                  {t('services.fee_management.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('services.fee_management.description')}
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
                  {t('services.admin_tools.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('services.admin_tools.description')}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* Client Success Stories */}
      <Box id="references" sx={{ py: 10, bgcolor: '#f5f5f5' }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h3"
              align="center"
              sx={{ 
                mb: 2, 
                fontWeight: 'bold', 
                color: '#333',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 4,
                  bgcolor: 'primary.main',
                  borderRadius: 2,
                },
                pb: 2,
              }}
            >
              {t('references.title')}
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{ mb: 6, color: '#666', fontSize: '1.1rem' }}
            >
              {t('references.subtitle')}
            </Typography>
          </motion.div>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 4,
              }}
            >
              {['district', 'community', 'city', 'ward'].map((testimonial, index) => (
                <motion.div
                  key={testimonial}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Paper 
                    sx={{ 
                      p: 4, 
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6,
                      },
                      '&::before': {
                        content: '"""',
                        position: 'absolute',
                        top: -10,
                        left: 20,
                        fontSize: '120px',
                        color: 'rgba(198, 40, 40, 0.1)',
                        fontFamily: 'Georgia, serif',
                        lineHeight: 1,
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                        {t(`references.testimonials.${testimonial}.title`)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8, fontStyle: 'italic' }}>
                        "{t(`references.testimonials.${testimonial}.content`)}"
                      </Typography>
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                        — {t(`references.testimonials.${testimonial}.author`)}
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* About Pyramidon Section */}
      <Box id="about" sx={{ py: 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 6,
                alignItems: 'center',
              }}
            >
              <motion.div variants={fadeInUp} style={{ flex: 1 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 'bold', 
                    color: '#333',
                    position: 'relative',
                    display: 'inline-block',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -10,
                      left: 0,
                      width: 60,
                      height: 4,
                      bgcolor: 'primary.main',
                      borderRadius: 2,
                    },
                    pb: 2,
                  }}
                >
                  {t('about.title')}
                </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#666', lineHeight: 1.8 }}>
                {t('about.paragraph1')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#666', lineHeight: 1.8 }}>
                {t('about.paragraph2')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#666', lineHeight: 1.8 }}>
                {t('about.paragraph3')}
              </Typography>
            </motion.div>
            <motion.div variants={fadeInUp} style={{ flex: 1 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 3,
                }}
              >
                {[
                  { value: '500+', label: 'clients' },
                  { value: '1M+', label: 'households' },
                  { value: '99.9%', label: 'uptime' },
                  { value: '24/7', label: 'support' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Paper 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: 6,
                          bgcolor: 'primary.main',
                          '& h3, & .MuiTypography-body2': {
                            color: 'white',
                          },
                        },
                      }}
                    >
                      <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold', transition: 'color 0.3s' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ transition: 'color 0.3s' }}>
                        {t(`about.stats.${stat.label}`)}
                      </Typography>
                    </Paper>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Get In Touch Section */}
      <Box
        id="contact"
        sx={{
          py: 10,
          background: 'linear-gradient(135deg, #c62828 0%, #8e0000 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h3"
              align="center"
              sx={{ mb: 2, fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
            >
              {t('contact.title')}
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{ mb: 6, fontSize: '1.1rem', opacity: 0.95 }}
            >
              {t('contact.subtitle')}
            </Typography>
          </motion.div>
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
                  {t('contact.form.title')}
                </Typography>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField fullWidth label={t('contact.form.fullname')} variant="outlined" />
                  <TextField fullWidth label={t('contact.form.email')} variant="outlined" type="email" />
                  <TextField fullWidth label={t('contact.form.subject')} variant="outlined" />
                  <TextField
                    fullWidth
                    label={t('contact.form.message')}
                    variant="outlined"
                    multiline
                    rows={4}
                  />
                  <Button variant="contained" size="large" sx={{ mt: 2 }}>
                    {t('contact.form.submit')}
                  </Button>
                </Box>
              </Paper>
            </Box>
            <Box sx={{ flex: 1, color: 'white' }}>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>
                {t('contact.info.title')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmailIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                      {t('contact.info.email.label')}
                    </Typography>
                    <Typography variant="body1">{t('contact.info.email.value')}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PhoneIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                      {t('contact.info.phone.label')}
                    </Typography>
                    <Typography variant="body1">{t('contact.info.phone.value')}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOnIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                      {t('contact.info.address.label')}
                    </Typography>
                    <Typography variant="body1">
                      {t('contact.info.address.value')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ mt: 6 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('contact.info.hours.title')}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {t('contact.info.hours.weekdays')}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {t('contact.info.hours.saturday')}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {t('contact.info.hours.sunday')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a1a1a', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
              {t('footer.copyright')}
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Scroll to Top Button */}
      <ScrollTop />
    </Box>
  );
};

export default HomePage;
