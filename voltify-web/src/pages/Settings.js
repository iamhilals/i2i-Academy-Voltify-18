import React, { useState, useEffect } from 'react';
import { User, Mail, Bell, Shield, Save, CheckCircle2, Camera, Phone, Sparkles, KeyRound } from 'lucide-react';
import { authService } from '../services/authService';

const AVATAR_SEEDS = [
  { id: 'Felix', label: 'Felix (Klasik)' },
  { id: 'Aneka', label: 'Aneka' },
  { id: 'Brian', label: 'Brian' },
  { id: 'Chester', label: 'Chester' },
  { id: 'Sophia', label: 'Sophia' },
  { id: 'Zack', label: 'Zack' }
];

const Settings = () => {
  const initialUser = authService.getCurrentUser() || {};

  const defaultUsername = initialUser.username || 'sude';
  const defaultEmail = initialUser.email || `${defaultUsername}@voltify.com`;
  const defaultPhone = initialUser.phone || '0532 100 20 30';
  const defaultFullName = initialUser.fullName || defaultUsername;

  const [currentUser, setCurrentUser] = useState(initialUser);
  const [fullName, setFullName] = useState(defaultFullName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState(defaultPhone);
  const [username, setUsername] = useState(defaultUsername);
  const [selectedAvatar, setSelectedAvatar] = useState(initialUser.avatar || 'Felix');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [quotaWarnings, setQuotaWarnings] = useState(true);
  const [billingReminders, setBillingReminders] = useState(true);

  // Status feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser() || {};
    const uname = user.username || 'sude';
    const em = user.email || `${uname}@voltify.com`;
    const ph = user.phone || '0532 100 20 30';
    const fn = user.fullName || uname;

    setCurrentUser(user);
    setFullName(fn);
    setEmail(em);
    setPhone(ph);
    setUsername(uname);
    if (user.avatar) setSelectedAvatar(user.avatar);
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      fullName: fullName.trim() || username,
      email: email.trim() || `${username}@voltify.com`,
      phone: phone.trim() || '0532 100 20 30',
      username: username.trim() || 'sude',
      avatar: selectedAvatar
    };

    localStorage.setItem('voltify_user', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('voltify_user_updated'));

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor.');
      return;
    }

    // Success simulation
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setPasswordSuccess(false);
    }, 3000);
  };

  const getAvatarUrl = (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=e2e8f0`;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col animate-in fade-in zoom-in-95 duration-300 pb-16">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gray-900 dark:bg-emerald-950/40 text-white dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-md">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Hesap ve Profil Ayarları</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium ml-1">Kişisel bilgilerinizi, profil avatarınızı ve güvenlik tercihlerinizi güncelleyin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Quick Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1E271F] border border-gray-100 dark:border-emerald-950/30 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            
            {/* Avatar Preview */}
            <div className="relative mb-4 group cursor-pointer">
              <div className="w-28 h-28 rounded-full bg-gray-100 border-4 border-[#4C811F] shadow-lg overflow-hidden transition-transform group-hover:scale-105">
                <img src={getAvatarUrl(selectedAvatar)} alt="Avatar Preview" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</h3>
            <p className="text-xs text-gray-400 font-medium mb-4">{email}</p>

            <span className="px-3 py-1 bg-green-100 dark:bg-emerald-950/40 text-green-700 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              Baş Stratejist • Seviye 42
            </span>

            {/* Avatar Selection Grid */}
            <div className="w-full pt-4 border-t border-gray-100 dark:border-emerald-950/20">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 text-left">Avatar Stili Seçin</p>
              <div className="grid grid-cols-3 gap-2">
                {AVATAR_SEEDS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedAvatar(item.id)}
                    className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      selectedAvatar === item.id 
                        ? 'border-[#4C811F] bg-green-50 dark:bg-emerald-950/30 ring-2 ring-[#4C811F]/30' 
                        : 'border-gray-200 dark:border-emerald-950/20 hover:bg-gray-50 dark:hover:bg-emerald-950/10'
                    }`}
                  >
                    <img src={getAvatarUrl(item.id)} alt={item.label} className="w-8 h-8 rounded-full" />
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 truncate w-full">{item.id}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Info Box */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <h4 className="font-bold text-sm">Güvenlik Durumu</h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-medium mb-4">
              Hesabınız 256-bit JWT şifrelemesi ve role-based yetkilendirme ile korunuyor.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-400 bg-green-950/40 px-2.5 py-1 rounded-lg border border-green-800/40">
              <CheckCircle2 className="w-3.5 h-3.5" /> Hesabınız Korumada
            </span>
          </div>
        </div>

        {/* Right Column: Forms & Settings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Form */}
          <div className="bg-white dark:bg-[#1E271F] border border-gray-100 dark:border-emerald-950/30 rounded-3xl p-8 shadow-sm">
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-emerald-950/20">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-[#4C811F]" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Kişisel Bilgiler</h3>
              </div>
              {saveSuccess && (
                <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full flex items-center gap-1 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4" /> Değişiklikler Kaydedildi!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Ad Soyad</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#182119] border border-gray-200 dark:border-emerald-950/40 rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#4C811F] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Kullanıcı Adı</label>
                  <div className="relative">
                    <Sparkles className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#182119] border border-gray-200 dark:border-emerald-950/40 rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#4C811F] transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">E-posta Adresi</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#182119] border border-gray-200 dark:border-emerald-950/40 rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#4C811F] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Telefon Numarası</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#182119] border border-gray-200 dark:border-emerald-950/40 rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#4C811F] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  className="px-6 py-3 bg-[#4C811F] hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>

          {/* Password Change Form */}
          <div className="bg-white dark:bg-[#1E271F] border border-gray-100 dark:border-emerald-950/30 rounded-3xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-emerald-950/20">
              <div className="flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-[#4C811F]" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Şifre Değiştir</h3>
              </div>
              {passwordSuccess && (
                <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full flex items-center gap-1 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4" /> Şifreniz Güncellendi!
                </span>
              )}
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Mevcut Şifre</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#182119] border border-gray-200 dark:border-emerald-950/40 rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#4C811F] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Yeni Şifre</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#182119] border border-gray-200 dark:border-emerald-950/40 rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#4C811F] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Yeni Şifre (Tekrar)</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#182119] border border-gray-200 dark:border-emerald-950/40 rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#4C811F] transition-colors"
                  />
                </div>
              </div>

              {passwordError && (
                <p className="text-xs font-bold text-red-500 pt-1">{passwordError}</p>
              )}

              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  className="px-6 py-3 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
                >
                  Şifreyi Güncelle
                </button>
              </div>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white dark:bg-[#1E271F] border border-gray-100 dark:border-emerald-950/30 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-emerald-950/20">
              <Bell className="w-5 h-5 text-[#4C811F]" />
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Bildirim Tercihleri</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#182119] rounded-2xl">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">E-posta Bildirimleri</h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Kritik durumlarda tarafınıza e-posta ile ulaşılsın.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-5 h-5 accent-[#4C811F] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#182119] rounded-2xl">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Kota ve Bütçe İkazları</h4>
                  <p className="text-xs text-gray-500 font-medium">%80 ve %100 bütçe limitlerinde uyarılırsınız.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={quotaWarnings}
                  onChange={(e) => setQuotaWarnings(e.target.checked)}
                  className="w-5 h-5 accent-[#4C811F] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#182119] rounded-2xl">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Fatura ve Ödeme Hatırlatıcıları</h4>
                  <p className="text-xs text-gray-500 font-medium">Son ödeme tarihinden önce bildirim gönderilir.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={billingReminders}
                  onChange={(e) => setBillingReminders(e.target.checked)}
                  className="w-5 h-5 accent-[#4C811F] cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Settings;
