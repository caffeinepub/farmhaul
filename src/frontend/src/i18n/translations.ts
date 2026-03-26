export type Lang = "en" | "hi" | "kn";

export const translations = {
  en: {
    // Nav
    nav_home: "Home",
    nav_dashboard: "Dashboard",
    nav_track: "Track Order",
    nav_stats: "Stats",
    nav_login: "Login",
    nav_logout: "Logout",
    nav_lang: "हिंदी",
    nav_my_dashboard: "My Dashboard",
    nav_profile: "Profile",

    // Hero
    hero_tagline: "Transport your crops",
    hero_tagline_hi: "फसल पहुँचाएं आसानी से",
    hero_subtitle:
      "Connect with nearby drivers and get your harvest to market fast, fresh, and affordable.",
    hero_cta_farmer: "Request Pickup",
    hero_cta_driver: "Become a Driver",

    // Stats
    stat_deliveries: "Total Deliveries",
    stat_farmers: "Farmers Joined",
    stat_drivers: "Active Drivers",
    stat_requests: "Total Requests",

    // Auth
    auth_title: "Join FarmHaul",
    auth_subtitle: "Connect farmers and drivers across India",
    auth_name_label: "Your Name",
    auth_name_placeholder: "Enter your full name",
    auth_role_label: "I am a",
    auth_role_farmer: "Farmer",
    auth_role_driver: "Driver",
    auth_submit: "Get Started",
    auth_logging_in: "Connecting...",
    auth_switch_role: "Switch Role",

    // Farmer Dashboard
    farmer_title: "Farmer Dashboard",
    farmer_new_request: "New Pickup Request",
    farmer_crop_type: "Crop Type",
    farmer_quantity: "Quantity (kg)",
    farmer_pickup: "Pickup Location",
    farmer_drop: "Drop Location",
    farmer_time: "Scheduled Time",
    farmer_estimate: "Estimated Cost",
    farmer_submit: "Request Pickup",
    farmer_submitting: "Submitting...",
    farmer_my_requests: "My Requests",
    farmer_no_requests: "No requests yet. Create your first pickup request!",

    // Crop types
    crop_rice: "Rice",
    crop_wheat: "Wheat",
    crop_vegetables: "Vegetables",
    crop_fruits: "Fruits",
    crop_other: "Other",

    // Driver Dashboard
    driver_title: "Driver Dashboard",
    driver_available: "Available Requests",
    driver_my_jobs: "My Active Jobs",
    driver_accept: "Accept Request",
    driver_pickup_done: "Mark Picked Up",
    driver_delivered: "Mark Delivered",
    driver_no_requests: "No pending requests nearby. Check back soon!",
    driver_no_jobs: "No active jobs right now.",

    // Order tracking
    track_title: "Track Order",
    track_requested: "Requested",
    track_accepted: "Accepted",
    track_picked_up: "Picked Up",
    track_delivered: "Delivered",
    track_chat: "Chat",
    track_send: "Send",
    track_message_placeholder: "Type a message...",
    track_no_messages: "No messages yet. Start the conversation!",

    // Status badges
    status_pending: "Pending",
    status_accepted: "Accepted",
    status_pickedUp: "Picked Up",
    status_delivered: "Delivered",

    // Common
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Retry",
    from: "From",
    to: "To",
    price: "Price",
    quantity: "Quantity",
    crop: "Crop",
    time: "Time",
  },
  hi: {
    // Nav
    nav_home: "होम",
    nav_dashboard: "डैशबोर्ड",
    nav_track: "ऑर्डर ट्रैक",
    nav_stats: "आँकड़े",
    nav_login: "लॉगिन",
    nav_logout: "लॉगआउट",
    nav_lang: "ಕನ್ನಡ",
    nav_my_dashboard: "मेरा डैशबोर्ड",
    nav_profile: "प्रोफ़ाइल",

    // Hero
    hero_tagline: "फसल पहुँचाएं आसानी से",
    hero_tagline_hi: "Transport your crops easily",
    hero_subtitle:
      "नजदीकी ड्राइवरों से जुड़ें और अपनी फसल को बाजार तक जल्दी, ताजा और किफायती तरीके से पहुँचाएं।",
    hero_cta_farmer: "पिकअप अनुरोध करें",
    hero_cta_driver: "ड्राइवर बनें",

    // Stats
    stat_deliveries: "कुल डिलीवरी",
    stat_farmers: "जुड़े किसान",
    stat_drivers: "सक्रिय ड्राइवर",
    stat_requests: "कुल अनुरोध",

    // Auth
    auth_title: "FarmHaul से जुड़ें",
    auth_subtitle: "पूरे भारत में किसानों और ड्राइवरों को जोड़ें",
    auth_name_label: "आपका नाम",
    auth_name_placeholder: "पूरा नाम दर्ज करें",
    auth_role_label: "मैं हूँ",
    auth_role_farmer: "किसान",
    auth_role_driver: "ड्राइवर",
    auth_submit: "शुरू करें",
    auth_logging_in: "जोड़ रहे हैं...",
    auth_switch_role: "भूमिका बदलें",

    // Farmer Dashboard
    farmer_title: "किसान डैशबोर्ड",
    farmer_new_request: "नया पिकअप अनुरोध",
    farmer_crop_type: "फसल का प्रकार",
    farmer_quantity: "मात्रा (किग्रा)",
    farmer_pickup: "पिकअप स्थान",
    farmer_drop: "डिलीवरी स्थान",
    farmer_time: "निर्धारित समय",
    farmer_estimate: "अनुमानित लागत",
    farmer_submit: "पिकअप अनुरोध करें",
    farmer_submitting: "सबमिट हो रहा है...",
    farmer_my_requests: "मेरे अनुरोध",
    farmer_no_requests: "अभी तक कोई अनुरोध नहीं। अपना पहला पिकअप अनुरोध बनाएं!",

    // Crop types
    crop_rice: "चावल",
    crop_wheat: "गेहूँ",
    crop_vegetables: "सब्ज़ियाँ",
    crop_fruits: "फल",
    crop_other: "अन्य",

    // Driver Dashboard
    driver_title: "ड्राइवर डैशबोर्ड",
    driver_available: "उपलब्ध अनुरोध",
    driver_my_jobs: "मेरे सक्रिय काम",
    driver_accept: "अनुरोध स्वीकार करें",
    driver_pickup_done: "पिकअप हो गया",
    driver_delivered: "डिलीवर हो गया",
    driver_no_requests: "कोई लंबित अनुरोध नहीं। जल्द जांचें!",
    driver_no_jobs: "अभी कोई सक्रिय काम नहीं।",

    // Order tracking
    track_title: "ऑर्डर ट्रैक करें",
    track_requested: "अनुरोध किया",
    track_accepted: "स्वीकार किया",
    track_picked_up: "पिकअप हुआ",
    track_delivered: "डिलीवर हुआ",
    track_chat: "बात करें",
    track_send: "भेजें",
    track_message_placeholder: "संदेश टाइप करें...",
    track_no_messages: "अभी कोई संदेश नहीं।",

    // Status badges
    status_pending: "लंबित",
    status_accepted: "स्वीकृत",
    status_pickedUp: "पिकअप हुआ",
    status_delivered: "डिलीवर हुआ",

    // Common
    loading: "लोड हो रहा है...",
    error: "कुछ गलत हुआ",
    retry: "पुनः प्रयास",
    from: "से",
    to: "तक",
    price: "कीमत",
    quantity: "मात्रा",
    crop: "फसल",
    time: "समय",
  },
  kn: {
    // Nav
    nav_home: "ಮುಖಪುಟ",
    nav_dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    nav_track: "ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್",
    nav_stats: "ಅಂಕಿಅಂಶ",
    nav_login: "ಲಾಗಿನ್",
    nav_logout: "ಲಾಗ್‌ಔಟ್",
    nav_lang: "English",
    nav_my_dashboard: "ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    nav_profile: "ಪ್ರೊಫೈಲ್",

    // Hero
    hero_tagline: "ಬೆಳೆ ಸಾಗಿಸಿ ಸುಲಭವಾಗಿ",
    hero_tagline_hi: "Transport your crops easily",
    hero_subtitle:
      "ಹತ್ತಿರದ ಚಾಲಕರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ ಮತ್ತು ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಮಾರುಕಟ್ಟೆಗೆ ತ್ವರಿತವಾಗಿ, ತಾಜಾ ಮತ್ತು ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ ತಲುಪಿಸಿ.",
    hero_cta_farmer: "ಪಿಕ್‌ಅಪ್ ಕೋರಿಕೆ ಮಾಡಿ",
    hero_cta_driver: "ಚಾಲಕನಾಗಿ",

    // Stats
    stat_deliveries: "ಒಟ್ಟು ಡೆಲಿವರಿ",
    stat_farmers: "ಸೇರಿದ ರೈತರು",
    stat_drivers: "ಸಕ್ರಿಯ ಚಾಲಕರು",
    stat_requests: "ಒಟ್ಟು ವಿನಂತಿಗಳು",

    // Auth
    auth_title: "FarmHaul ಗೆ ಸೇರಿ",
    auth_subtitle: "ಭಾರತದ ರೈತರು ಮತ್ತು ಚಾಲಕರನ್ನು ಸಂಪರ್ಕಿಸಿ",
    auth_name_label: "ನಿಮ್ಮ ಹೆಸರು",
    auth_name_placeholder: "ಪೂರ್ಣ ಹೆಸರು ನಮೂದಿಸಿ",
    auth_role_label: "ನಾನು ಒಬ್ಬ",
    auth_role_farmer: "ರೈತ",
    auth_role_driver: "ಚಾಲಕ",
    auth_submit: "ಪ್ರಾರಂಭಿಸಿ",
    auth_logging_in: "ಸಂಪರ್ಕಿಸುತ್ತಿದ್ದೇವೆ...",
    auth_switch_role: "ಪಾತ್ರ ಬದಲಿಸಿ",

    // Farmer Dashboard
    farmer_title: "ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    farmer_new_request: "ಹೊಸ ಪಿಕ್‌ಅಪ್ ವಿನಂತಿ",
    farmer_crop_type: "ಬೆಳೆ ವಿಧ",
    farmer_quantity: "ಪ್ರಮಾಣ (ಕೆಜಿ)",
    farmer_pickup: "ಪಿಕ್‌ಅಪ್ ಸ್ಥಳ",
    farmer_drop: "ಡ್ರಾಪ್ ಸ್ಥಳ",
    farmer_time: "ನಿಗದಿತ ಸಮಯ",
    farmer_estimate: "ಅಂದಾಜು ವೆಚ್ಚ",
    farmer_submit: "ಪಿಕ್‌ಅಪ್ ಕೋರಿಕೆ ಮಾಡಿ",
    farmer_submitting: "ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...",
    farmer_my_requests: "ನನ್ನ ವಿನಂತಿಗಳು",
    farmer_no_requests: "ಇನ್ನೂ ಯಾವುದೇ ವಿನಂತಿ ಇಲ್ಲ. ನಿಮ್ಮ ಮೊದಲ ಪಿಕ್‌ಅಪ್ ವಿನಂತಿ ಮಾಡಿ!",

    // Crop types
    crop_rice: "ಅಕ್ಕಿ",
    crop_wheat: "ಗೋಧಿ",
    crop_vegetables: "ತರಕಾರಿಗಳು",
    crop_fruits: "ಹಣ್ಣುಗಳು",
    crop_other: "ಇತರೆ",

    // Driver Dashboard
    driver_title: "ಚಾಲಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    driver_available: "ಲಭ್ಯ ವಿನಂತಿಗಳು",
    driver_my_jobs: "ನನ್ನ ಸಕ್ರಿಯ ಕೆಲಸಗಳು",
    driver_accept: "ವಿನಂತಿ ಸ್ವೀಕರಿಸಿ",
    driver_pickup_done: "ಪಿಕ್‌ಅಪ್ ಆಯಿತು",
    driver_delivered: "ಡೆಲಿವರಿ ಆಯಿತು",
    driver_no_requests: "ಹತ್ತಿರ ಯಾವುದೇ ಲಂಬಿತ ವಿನಂತಿ ಇಲ್ಲ. ಶೀಘ್ರದಲ್ಲೇ ಪರಿಶೀಲಿಸಿ!",
    driver_no_jobs: "ಈಗ ಯಾವುದೇ ಸಕ್ರಿಯ ಕೆಲಸ ಇಲ್ಲ.",

    // Order tracking
    track_title: "ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    track_requested: "ವಿನಂತಿ ಮಾಡಲಾಗಿದೆ",
    track_accepted: "ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    track_picked_up: "ಪಿಕ್‌ಅಪ್ ಆಗಿದೆ",
    track_delivered: "ಡೆಲಿವರಿ ಆಗಿದೆ",
    track_chat: "ಮಾತನಾಡಿ",
    track_send: "ಕಳುಹಿಸಿ",
    track_message_placeholder: "ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...",
    track_no_messages: "ಇನ್ನೂ ಯಾವುದೇ ಸಂದೇಶ ಇಲ್ಲ.",

    // Status badges
    status_pending: "ಬಾಕಿ ಇದೆ",
    status_accepted: "ಸ್ವೀಕೃತ",
    status_pickedUp: "ಪಿಕ್‌ಅಪ್ ಆಗಿದೆ",
    status_delivered: "ಡೆಲಿವರಿ ಆಗಿದೆ",

    // Common
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    error: "ಏನೋ ತಪ್ಪಾಯಿತು",
    retry: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    from: "ಇಂದ",
    to: "ಗೆ",
    price: "ಬೆಲೆ",
    quantity: "ಪ್ರಮಾಣ",
    crop: "ಬೆಳೆ",
    time: "ಸಮಯ",
  },
};

export type TranslationKey = keyof typeof translations.en;
