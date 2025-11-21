"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
    en: {
        translation: {
            // Common
            'common.submit': 'Submit',
            'common.cancel': 'Cancel',
            'common.save': 'Save',
            'common.delete': 'Delete',
            'common.edit': 'Edit',
            'common.search': 'Search',
            'common.filter': 'Filter',
            'common.loading': 'Loading...',
            'common.error': 'Error',
            'common.success': 'Success',

            // Navigation
            'nav.home': 'Home',
            'nav.dashboard': 'Dashboard',
            'nav.report': 'Report Complaint',
            'nav.map': 'Heat Map',
            'nav.analytics': 'Analytics',
            'nav.profile': 'Profile',
            'nav.logout': 'Logout',

            // Auth
            'auth.login': 'Login',
            'auth.register': 'Register',
            'auth.email': 'Email',
            'auth.password': 'Password',
            'auth.forgotPassword': 'Forgot Password?',
            'auth.dontHaveAccount': "Don't have an account?",
            'auth.alreadyHaveAccount': 'Already have an account?',

            // Complaints
            'complaint.title': 'Complaint Title',
            'complaint.description': 'Description',
            'complaint.category': 'Category',
            'complaint.location': 'Location',
            'complaint.status': 'Status',
            'complaint.priority': 'Priority',
            'complaint.submit': 'Submit Complaint',
            'complaint.submitted': 'Submitted',
            'complaint.acknowledged': 'Acknowledged',
            'complaint.inProgress': 'In Progress',
            'complaint.resolved': 'Resolved',
            'complaint.closed': 'Closed',

            // Dashboard
            'dashboard.welcome': 'Welcome back',
            'dashboard.totalComplaints': 'Total Complaints',
            'dashboard.resolved': 'Resolved',
            'dashboard.pending': 'Pending',
            'dashboard.recentComplaints': 'Recent Complaints',
        },
    },
    hi: {
        translation: {
            // Common
            'common.submit': 'जमा करें',
            'common.cancel': 'रद्द करें',
            'common.save': 'सहेजें',
            'common.delete': 'हटाएं',
            'common.edit': 'संपादित करें',
            'common.search': 'खोजें',
            'common.filter': 'फ़िल्टर',
            'common.loading': 'लोड हो रहा है...',
            'common.error': 'त्रुटि',
            'common.success': 'सफलता',

            // Navigation
            'nav.home': 'होम',
            'nav.dashboard': 'डैशबोर्ड',
            'nav.report': 'शिकायत दर्ज करें',
            'nav.map': 'हीट मैप',
            'nav.analytics': 'विश्लेषण',
            'nav.profile': 'प्रोफ़ाइल',
            'nav.logout': 'लॉगआउट',

            // Auth
            'auth.login': 'लॉगिन',
            'auth.register': 'पंजीकरण',
            'auth.email': 'ईमेल',
            'auth.password': 'पासवर्ड',
            'auth.forgotPassword': 'पासवर्ड भूल गए?',
            'auth.dontHaveAccount': 'खाता नहीं है?',
            'auth.alreadyHaveAccount': 'पहले से खाता है?',

            // Complaints
            'complaint.title': 'शिकायत शीर्षक',
            'complaint.description': 'विवरण',
            'complaint.category': 'श्रेणी',
            'complaint.location': 'स्थान',
            'complaint.status': 'स्थिति',
            'complaint.priority': 'प्राथमिकता',
            'complaint.submit': 'शिकायत दर्ज करें',
            'complaint.submitted': 'प्रस्तुत',
            'complaint.acknowledged': 'स्वीकृत',
            'complaint.inProgress': 'प्रगति में',
            'complaint.resolved': 'हल हो गया',
            'complaint.closed': 'बंद',

            // Dashboard
            'dashboard.welcome': 'वापसी पर स्वागत है',
            'dashboard.totalComplaints': 'कुल शिकायतें',
            'dashboard.resolved': 'हल हो गया',
            'dashboard.pending': 'लंबित',
            'dashboard.recentComplaints': 'हाल की शिकायतें',
        },
    },
    ta: {
        translation: {
            // Common
            'common.submit': 'சமர்ப்பிக்கவும்',
            'common.cancel': 'ரத்து செய்',
            'common.save': 'சேமி',
            'common.delete': 'நீக்கு',
            'common.edit': 'திருத்து',
            'common.search': 'தேடு',
            'common.filter': 'வடிகட்டி',
            'common.loading': 'ஏற்றுகிறது...',
            'common.error': 'பிழை',
            'common.success': 'வெற்றி',

            // Navigation
            'nav.home': 'முகப்பு',
            'nav.dashboard': 'டாஷ்போர்டு',
            'nav.report': 'புகார் பதிவு செய்',
            'nav.map': 'வெப்ப வரைபடம்',
            'nav.analytics': 'பகுப்பாய்வு',
            'nav.profile': 'சுயவிவரம்',
            'nav.logout': 'வெளியேறு',

            // Auth
            'auth.login': 'உள்நுழைய',
            'auth.register': 'பதிவு செய்',
            'auth.email': 'மின்னஞ்சல்',
            'auth.password': 'கடவுச்சொல்',
            'auth.forgotPassword': 'கடவுச்சொல் மறந்துவிட்டதா?',

            // Complaints
            'complaint.title': 'புகார் தலைப்பு',
            'complaint.description': 'விளக்கம்',
            'complaint.category': 'வகை',
            'complaint.location': 'இடம்',
            'complaint.status': 'நிலை',
            'complaint.submit': 'புகார் சமர்ப்பிக்கவும்',
        },
    },
    te: {
        translation: {
            // Common
            'common.submit': 'సమర్పించండి',
            'common.cancel': 'రద్దు చేయండి',
            'common.save': 'సేవ్ చేయండి',
            'common.delete': 'తొలగించండి',
            'common.edit': 'సవరించండి',
            'common.search': 'వెతకండి',
            'common.filter': 'ఫిల్టర్',
            'common.loading': 'లోడ్ అవుతోంది...',

            // Navigation
            'nav.home': 'హోమ్',
            'nav.dashboard': 'డాష్‌బోర్డ్',
            'nav.report': 'ఫిర్యాదు నమోదు చేయండి',
            'nav.map': 'హీట్ మ్యాప్',
            'nav.analytics': 'విశ్లేషణ',

            // Complaints
            'complaint.title': 'ఫిర్యాదు శీర్షిక',
            'complaint.description': 'వివరణ',
            'complaint.category': 'వర్గం',
            'complaint.location': 'స్థానం',
            'complaint.submit': 'ఫిర్యాదు సమర్పించండి',
        },
    },
    bn: {
        translation: {
            // Common
            'common.submit': 'জমা দিন',
            'common.cancel': 'বাতিল করুন',
            'common.save': 'সংরক্ষণ করুন',
            'common.search': 'অনুসন্ধান',

            // Navigation
            'nav.home': 'হোম',
            'nav.dashboard': 'ড্যাশবোর্ড',
            'nav.report': 'অভিযোগ দায়ের করুন',

            // Complaints
            'complaint.title': 'অভিযোগের শিরোনাম',
            'complaint.description': 'বিবরণ',
            'complaint.submit': 'অভিযোগ জমা দিন',
        },
    },
    mr: {
        translation: {
            // Common
            'common.submit': 'सबमिट करा',
            'common.cancel': 'रद्द करा',
            'common.save': 'जतन करा',

            // Navigation
            'nav.home': 'मुख्यपृष्ठ',
            'nav.dashboard': 'डॅशबोर्ड',
            'nav.report': 'तक्रार नोंदवा',

            // Complaints
            'complaint.title': 'तक्रार शीर्षक',
            'complaint.description': 'वर्णन',
            'complaint.submit': 'तक्रार सबमिट करा',
        },
    },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: process.env.NODE_ENV === 'development',

        interpolation: {
            escapeValue: false,
        },

        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
