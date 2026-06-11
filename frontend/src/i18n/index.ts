import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      app: { name: "SecureMoney", tagline: "Secure Digital Wallet" },
      nav: { dashboard: "Dashboard", send: "Send Money", receive: "Receive Money", withdraw: "Withdraw", deposit: "Deposit", airtime: "Airtime", bills: "Bill Payments", merchant: "Merchant Payments", history: "History", security: "Security", admin: "Admin", profile: "Profile", settings: "Settings", notifications: "Notifications", logout: "Logout" },
      auth: { login: "Sign In", register: "Create Account", email: "Email address", password: "Password", confirm_password: "Confirm Password", full_name: "Full Name", phone: "Phone Number", mfa_token: "Authentication Code", no_account: "Don't have an account?", have_account: "Already have an account?", sign_up: "Sign Up", forgot: "Forgot password?", or: "or continue with", welcome_back: "Welcome back", create_account: "Create your account", enter_details: "Enter your credentials to access your account", fill_details: "Fill in your details to get started" },
      dashboard: { welcome: "Welcome", balance: "Total Balance", wallets: "Your Wallets", recent: "Recent Transactions", send: "Send Money", receive: "Receive", deposit_btn: "Deposit", withdraw_btn: "Withdraw", view_all: "View All", no_tx: "No recent transactions", quick_actions: "Quick Actions", monthly_spending: "Monthly Spending", overview: "Account Overview" },
      transfer: { title: "Send Money", from: "From Wallet", to: "Recipient Email", amount: "Amount", description: "Description (optional)", submit: "Send Money", success: "Transfer completed successfully!", failed: "Transfer failed. Please try again.", processing: "Processing transfer...", insufficient: "Insufficient funds", confirm: "Confirm Transfer", new_balance: "New Balance", fee: "Transfer Fee", recipient_label: "To" },
      receive: { title: "Receive Money", address: "Your Wallet Address", share: "Share your wallet address or QR code to receive payments", scan: "Scan to Pay", copy: "Copy Address", copied: "Address copied!", generate: "Generate QR Code" },
      history: { title: "Transaction History", no_tx: "No transactions yet", amount: "Amount", type: "Type", status: "Status", date: "Date", from: "From", to: "To", search: "Search transactions...", filter: "Filter", all: "All", completed: "Completed", pending: "Pending", failed: "Failed", export: "Export", receipt: "Receipt", download: "Download" },
      security: { title: "Security Settings", mfa: "Two-Factor Authentication", mfa_desc: "Add an extra layer of security to your account", enable: "Enable MFA", disable: "Disable MFA", scan_qr: "Scan this QR code with your authenticator app", enter_code: "Enter the 6-digit code from your authenticator app", verify: "Verify & Enable", success: "MFA has been enabled successfully", otp: "OTP Verification", pin: "Security PIN", pin_desc: "Set a security PIN for transactions", sessions: "Active Sessions", sessions_desc: "Manage your active login sessions", activity: "Login Activity", activity_desc: "View your recent login activity" },
      admin: { dashboard: "Admin Dashboard", users: "Users", audit: "Audit Logs", roles: "Roles", analytics: "Analytics", total_users: "Total Users", total_tx: "Total Transactions", total_wallets: "Total Wallets", recent_users: "Recent Users", create_role: "Create Role", role_name: "Role Name", actions: "Actions", no_logs: "No audit logs found", filter_action: "Filter by action" },
      settings: { title: "Settings", language: "Language", theme: "Theme", light: "Light", dark: "Dark", system: "System", profile: "Profile Settings", profile_desc: "Manage your personal information", notifications: "Notification Preferences", currency: "Default Currency", save: "Save Changes" },
      profile: { title: "My Profile", personal: "Personal Information", email: "Email", phone: "Phone", full_name: "Full Name", member_since: "Member since", edit: "Edit Profile", update_success: "Profile updated successfully" },
      notifications: { title: "Notifications", mark_read: "Mark All as Read", no_notifications: "No notifications yet", transfer: "Transfer", security: "Security", info: "Information" },
      common: { loading: "Loading...", error: "Something went wrong", save: "Save", cancel: "Cancel", search: "Search", no_data: "No data available", confirm: "Confirm", delete: "Delete", edit: "Edit", close: "Close", back: "Back", next: "Next", done: "Done", copied: "Copied!", currency_tzs: "TZS", currency_usd: "USD" }
    }
  },
  sw: {
    translation: {
      app: { name: "SecureMoney", tagline: "Mkoba Salama Dijitali" },
      nav: { dashboard: "Dashibodi", send: "Tuma Pesa", receive: "Pokea Pesa", withdraw: "Toa Pesa", deposit: "Weka Pesa", airtime: "Airtime", bills: "Malipo ya Bili", merchant: "Malipo ya Biashara", history: "Historia", security: "Usalama", admin: "Wasimamizi", profile: "Wasifu", settings: "Mipangilio", notifications: "Arifa", logout: "Toka" },
      auth: { login: "Ingia", register: "Fungua Akaunti", email: "Barua pepe", password: "Nywila", confirm_password: "Thibitisha Nywila", full_name: "Jina Kamili", phone: "Nambari ya Simu", mfa_token: "Msimbo wa Uthibitishaji", no_account: "Huna akaunti?", have_account: "Tayari una akaunti?", sign_up: "Jisajili", forgot: "Umesahau nywila?", or: "au endelea na", welcome_back: "Karibu tena", create_account: "Fungua akaunti yako", enter_details: "Weka hati zako kufikia akaunti yako", fill_details: "Jaza maelezo yako kuanza" },
      dashboard: { welcome: "Karibu", balance: "Jumla ya Salio", wallets: "Mikoba Yako", recent: "Shughuli za Hivi Karibuni", send: "Tuma Pesa", receive: "Pokea", deposit_btn: "Weka", withdraw_btn: "Toa", view_all: "Angalia Zote", no_tx: "Hakuna shughuli za hivi karibuni", quick_actions: "Vitendo vya Haraka", monthly_spending: "Matumizi ya Mwezi", overview: "Muhtasari wa Akaunti" },
      transfer: { title: "Tuma Pesa", from: "Kutoka kwenye Mkoba", to: "Barua pepe ya Mpokeaji", amount: "Kiasi", description: "Maelezo (si lazima)", submit: "Tuma Pesa", success: "Uhamisho umekamilika!", failed: "Uhamisho umeshindikana. Tafadhali jaribu tena.", processing: "Inashughulikia uhamisho...", insufficient: "Salio haitoshi", confirm: "Thibitisha Uhamisho", new_balance: "Salio Jipya", fee: "Ada ya Uhamisho", recipient_label: "Kwa" },
      receive: { title: "Pokea Pesa", address: "Anwani ya Mkoba Wako", share: "Shiriki anwani yako ya mkoba au msimbo wa QR kupokea malipo", scan: "Changanua Kulipa", copy: "Nakili Anwani", copied: "Anwani imenakiliwa!", generate: "Tengeneza Msimbo wa QR" },
      history: { title: "Historia ya Uhamisho", no_tx: "Hakuna uhamisho bado", amount: "Kiasi", type: "Aina", status: "Hali", date: "Tarehe", from: "Kutoka", to: "Kwa", search: "Tafuta uhamisho...", filter: "Chuja", all: "Zote", completed: "Imekamilika", pending: "Inasubiri", failed: "Imeshindikana", export: "Hamisha", receipt: "Risiti", download: "Pakua" },
      security: { title: "Mipangilio ya Usalama", mfa: "Uthibitishaji wa Hatua Mbili", mfa_desc: "Ongeza safu ya ziada ya usalama kwa akaunti yako", enable: "Washa MFA", disable: "Zima MFA", scan_qr: "Changanua msimbo huu wa QR kwa programu yako ya uthibitishaji", enter_code: "Ingiza msimbo wa tarakimu 6 kutoka kwa programu yako", verify: "Thibitisha na Washa", success: "MFA imewashwa kwa mafanikio", otp: "Uthibitishaji wa OTP", pin: "Nambari ya PIN ya Usalama", pin_desc: "Weka nambari ya PIN kwa ajili ya shughuli", sessions: "Vipindi Amilifu", sessions_desc: "Simamia vipindi vyako vya kuingia", activity: "Shughuli za Kuingia", activity_desc: "Angalia shughuli zako za hivi karibuni za kuingia" },
      admin: { dashboard: "Dashibodi ya Wasimamizi", users: "Watumiaji", audit: "Kumbukumbu", roles: "Majukumu", analytics: "Takwimu", total_users: "Jumla ya Watumiaji", total_tx: "Jumla ya Uhamisho", total_wallets: "Jumla ya Mikoba", recent_users: "Watumiaji wa Hivi Karibuni", create_role: "Unda Jukumu", role_name: "Jina la Jukumu", actions: "Vitendo", no_logs: "Hakuna kumbukumbu za ukaguzi", filter_action: "Chuja kwa hatua" },
      settings: { title: "Mipangilio", language: "Lugha", theme: "Mandhari", light: "Mwangaza", dark: "Giza", system: "Mfumo", profile: "Mipangilio ya Wasifu", profile_desc: "Simamia taarifa zako binafsi", notifications: "Mapendeleo ya Arifa", currency: "Sarafu Chaguo-msingi", save: "Hifadhi Mabadiliko" },
      profile: { title: "Wasifu Wangu", personal: "Taarifa Binafsi", email: "Barua pepe", phone: "Simu", full_name: "Jina Kamili", member_since: "Mwanachama tangu", edit: "Hariri Wasifu", update_success: "Wasifu umesasishwa kwa mafanikio" },
      notifications: { title: "Arifa", mark_read: "Weka Zote Kama Zimesomwa", no_notifications: "Hakuna arifa bado", transfer: "Uhamisho", security: "Usalama", info: "Taarifa" },
      common: { loading: "Inapakia...", error: "Kuna hitilafu imetokea", save: "Hifadhi", cancel: "Ghairi", search: "Tafuta", no_data: "Hakuna data", confirm: "Thibitisha", delete: "Futa", edit: "Hariri", close: "Funga", back: "Nyuma", next: "Endelea", done: "Imekamilika", copied: "Imenakiliwa!", currency_tzs: "TZS", currency_usd: "USD" }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("lang") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
