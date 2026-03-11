
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

const namespaces = [
  'common', 
  'login',
  'layout', 
  'dashboard', 
  'user', 
  'hoKhau', 
  'nhanKhau', 
  'bienDong', 
  'tamVangTamTru', 
  'thuPhi',
  'notifications',
  'home'
];

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['vi', 'ja'],
    fallbackLng: 'vi',
    debug: true,
    detection: {
      order: ['cookie', 'localStorage', 'htmlTag', 'path', 'subdomain'],
      caches: ['cookie', 'localStorage'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    ns: namespaces,
    defaultNS: 'common',
    fallbackNS: 'common',
  });

export default i18n;
