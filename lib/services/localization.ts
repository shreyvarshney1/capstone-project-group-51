// =============================================
// LOCALIZATION SERVICE
// Multi-language support for 10 Indian languages
// =============================================

import { SupportedLanguage } from "@/types"

/**
 * Language configuration
 */
export const SUPPORTED_LANGUAGES: {
  code: SupportedLanguage
  name: string
  nativeName: string
  rtl: boolean
}[] = [
  { code: "en", name: "English", nativeName: "English", rtl: false },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", rtl: false },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", rtl: false },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", rtl: false },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", rtl: false },
  { code: "mr", name: "Marathi", nativeName: "मराठी", rtl: false },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", rtl: false },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", rtl: false },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", rtl: false },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", rtl: false },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", rtl: false }
]

/**
 * Translation strings
 */
export const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.dashboard": "Dashboard",
    "nav.report": "Report Issue",
    "nav.map": "Map",
    "nav.feed": "Public Feed",
    "nav.login": "Sign In",
    "nav.logout": "Log Out",
    
    // Common
    "common.loading": "Loading...",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.all": "All",
    "common.none": "None",
    
    // Issue Form
    "issue.title": "Issue Title",
    "issue.title.placeholder": "e.g., Pothole on Main Street",
    "issue.description": "Description",
    "issue.description.placeholder": "Please provide detailed information...",
    "issue.category": "Category",
    "issue.category.select": "Select category",
    "issue.location": "Location",
    "issue.image": "Upload Image",
    "issue.voice": "Voice Note",
    "issue.submit": "Submit Report",
    "issue.submitting": "Submitting...",
    
    // Status
    "status.draft": "Draft",
    "status.submitted": "Submitted",
    "status.acknowledged": "Acknowledged",
    "status.assigned": "Assigned",
    "status.in_progress": "In Progress",
    "status.escalated": "Escalated",
    "status.resolved": "Resolved",
    "status.closed": "Closed",
    "status.rejected": "Rejected",
    
    // Priority
    "priority.low": "Low",
    "priority.medium": "Medium",
    "priority.high": "High",
    "priority.urgent": "Urgent",
    "priority.critical": "Critical",
    
    // Dashboard
    "dashboard.my_issues": "My Issues",
    "dashboard.no_issues": "No issues reported yet",
    "dashboard.report_first": "Report your first issue",
    
    // Community
    "community.vote": "Upvote",
    "community.comment": "Comment",
    "community.share": "Share",
    "community.comments": "Comments",
    "community.add_comment": "Add a comment...",
    
    // Notifications
    "notification.status_update": "Status Updated",
    "notification.new_comment": "New Comment",
    "notification.escalated": "Issue Escalated",
    
    // Accessibility
    "a11y.high_contrast": "High Contrast Mode",
    "a11y.font_size": "Font Size",
    "a11y.screen_reader": "Screen Reader Optimized"
  },
  
  hi: {
    // Navigation
    "nav.home": "होम",
    "nav.dashboard": "डैशबोर्ड",
    "nav.report": "शिकायत दर्ज करें",
    "nav.map": "नक्शा",
    "nav.feed": "सार्वजनिक फ़ीड",
    "nav.login": "लॉग इन करें",
    "nav.logout": "लॉग आउट",
    
    // Common
    "common.loading": "लोड हो रहा है...",
    "common.submit": "जमा करें",
    "common.cancel": "रद्द करें",
    "common.save": "सहेजें",
    "common.delete": "हटाएं",
    "common.edit": "संपादित करें",
    "common.view": "देखें",
    "common.search": "खोजें",
    "common.filter": "फ़िल्टर",
    "common.sort": "क्रमबद्ध करें",
    "common.all": "सभी",
    "common.none": "कोई नहीं",
    
    // Issue Form
    "issue.title": "शिकायत का शीर्षक",
    "issue.title.placeholder": "उदा., मुख्य सड़क पर गड्ढा",
    "issue.description": "विवरण",
    "issue.description.placeholder": "कृपया विस्तृत जानकारी दें...",
    "issue.category": "श्रेणी",
    "issue.category.select": "श्रेणी चुनें",
    "issue.location": "स्थान",
    "issue.image": "छवि अपलोड करें",
    "issue.voice": "वॉइस नोट",
    "issue.submit": "रिपोर्ट जमा करें",
    "issue.submitting": "जमा हो रहा है...",
    
    // Status
    "status.draft": "ड्राफ्ट",
    "status.submitted": "जमा किया गया",
    "status.acknowledged": "स्वीकृत",
    "status.assigned": "सौंपा गया",
    "status.in_progress": "प्रगति में",
    "status.escalated": "बढ़ाया गया",
    "status.resolved": "हल किया गया",
    "status.closed": "बंद",
    "status.rejected": "अस्वीकृत",
    
    // Priority
    "priority.low": "कम",
    "priority.medium": "मध्यम",
    "priority.high": "उच्च",
    "priority.urgent": "अति आवश्यक",
    "priority.critical": "गंभीर",
    
    // Dashboard
    "dashboard.my_issues": "मेरी शिकायतें",
    "dashboard.no_issues": "अभी तक कोई शिकायत दर्ज नहीं",
    "dashboard.report_first": "अपनी पहली शिकायत दर्ज करें",
    
    // Community
    "community.vote": "वोट करें",
    "community.comment": "टिप्पणी",
    "community.share": "साझा करें",
    "community.comments": "टिप्पणियां",
    "community.add_comment": "टिप्पणी जोड़ें...",
    
    // Notifications
    "notification.status_update": "स्थिति अपडेट",
    "notification.new_comment": "नई टिप्पणी",
    "notification.escalated": "शिकायत बढ़ाई गई",
    
    // Accessibility
    "a11y.high_contrast": "हाई कॉन्ट्रास्ट मोड",
    "a11y.font_size": "फ़ॉन्ट आकार",
    "a11y.screen_reader": "स्क्रीन रीडर अनुकूलित"
  },
  
  // Add placeholder translations for other languages
  ta: {
    "nav.home": "முகப்பு",
    "nav.dashboard": "டாஷ்போர்டு",
    "nav.report": "புகார் அளி",
    "common.loading": "ஏற்றுகிறது...",
    "common.submit": "சமர்ப்பி"
  },
  
  te: {
    "nav.home": "హోమ్",
    "nav.dashboard": "డాష్‌బోర్డ్",
    "nav.report": "సమస్య నివేదించండి",
    "common.loading": "లోడ్ అవుతోంది...",
    "common.submit": "సమర్పించు"
  },
  
  bn: {
    "nav.home": "হোম",
    "nav.dashboard": "ড্যাশবোর্ড",
    "nav.report": "অভিযোগ করুন",
    "common.loading": "লোড হচ্ছে...",
    "common.submit": "জমা দিন"
  },
  
  mr: {
    "nav.home": "मुख्यपृष्ठ",
    "nav.dashboard": "डॅशबोर्ड",
    "nav.report": "तक्रार नोंदवा",
    "common.loading": "लोड होत आहे...",
    "common.submit": "सबमिट करा"
  },
  
  gu: {
    "nav.home": "હોમ",
    "nav.dashboard": "ડેશબોર્ડ",
    "nav.report": "ફરિયાદ નોંધાવો",
    "common.loading": "લોડ થઈ રહ્યું છે...",
    "common.submit": "સબમિટ કરો"
  },
  
  kn: {
    "nav.home": "ಮುಖಪುಟ",
    "nav.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "nav.report": "ದೂರು ನೀಡಿ",
    "common.loading": "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    "common.submit": "ಸಲ್ಲಿಸು"
  },
  
  ml: {
    "nav.home": "ഹോം",
    "nav.dashboard": "ഡാഷ്‌ബോർഡ്",
    "nav.report": "പരാതി നൽകുക",
    "common.loading": "ലോഡ് ചെയ്യുന്നു...",
    "common.submit": "സമർപ്പിക്കുക"
  },
  
  pa: {
    "nav.home": "ਹੋਮ",
    "nav.dashboard": "ਡੈਸ਼ਬੋਰਡ",
    "nav.report": "ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ",
    "common.loading": "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    "common.submit": "ਜਮ੍ਹਾਂ ਕਰੋ"
  },
  
  or: {
    "nav.home": "ମୂଳପୃଷ୍ଠା",
    "nav.dashboard": "ଡ୍ୟାସବୋର୍ଡ",
    "nav.report": "ଅଭିଯୋଗ କର",
    "common.loading": "ଲୋଡ୍ ହେଉଛି...",
    "common.submit": "ଦାଖଲ କର"
  }
}

/**
 * Get translation for a key
 */
export function t(key: string, language: SupportedLanguage = "en"): string {
  return translations[language]?.[key] || translations.en[key] || key
}

/**
 * Get all translations for a language
 */
export function getTranslations(language: SupportedLanguage): Record<string, string> {
  return { ...translations.en, ...translations[language] }
}

/**
 * Detect user's preferred language from browser
 */
export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "en"
  
  const browserLang = navigator.language.split("-")[0] as SupportedLanguage
  const supported = SUPPORTED_LANGUAGES.map(l => l.code)
  
  return supported.includes(browserLang) ? browserLang : "en"
}

/**
 * Get category name in specified language
 */
export function getCategoryName(
  category: { 
    name: string
    nameHi?: string | null
    nameTa?: string | null
    nameTe?: string | null
    nameBn?: string | null
    nameMr?: string | null
    nameGu?: string | null
    nameKn?: string | null
    nameMl?: string | null
    namePa?: string | null
    nameOr?: string | null
  },
  language: SupportedLanguage
): string {
  const langMap: Record<SupportedLanguage, keyof typeof category> = {
    en: "name",
    hi: "nameHi",
    ta: "nameTa",
    te: "nameTe",
    bn: "nameBn",
    mr: "nameMr",
    gu: "nameGu",
    kn: "nameKn",
    ml: "nameMl",
    pa: "namePa",
    or: "nameOr"
  }
  
  const key = langMap[language]
  return (category[key] as string) || category.name
}
