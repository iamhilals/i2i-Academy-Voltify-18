import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Mail, Search, Inbox as InboxIcon, Star, Trash2, ArrowRight, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { inboxService } from '../services/inboxService';
import MarkdownText from '../components/MarkdownText';

const mockEmails = [
  {
    id: 1,
    sender: 'Voltify Destek',
    subject: 'Voltify\'a Hoş Geldiniz! 🚀',
    preview: 'Hesabınız başarıyla oluşturuldu. Akıllı evinizin potansiyelini...',
    date: '10:45',
    isUnread: true,
    isStarred: true,
    type: 'welcome',
    content: (
      <div className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <Zap className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-center text-gray-900">Voltify Ailesine Hoş Geldiniz!</h2>
        <p className="text-gray-600 text-base leading-relaxed text-center">
          Hesabınız başarıyla doğrulandı. Artık evinizdeki tüm cihazları yapay zeka destekli altyapımızla yönetebilir, enerji tüketimini optimize edebilir ve faturalarınızda %30'a varan tasarruf sağlayabilirsiniz.
        </p>
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center space-y-4">
          <h4 className="font-bold text-gray-900">Hemen Başlamak İçin:</h4>
          <ol className="text-sm font-medium text-gray-600 text-left list-decimal list-inside space-y-2 max-w-sm mx-auto">
            <li>Lokasyonlarınızı (Ev, Ofis) tanımlayın.</li>
            <li>Akıllı cihazlarınızı sisteme entegre edin.</li>
            <li>Volty AI asistanınızla sohbete başlayın.</li>
          </ol>
        </div>
        <div className="text-center pt-4">
          <button className="px-8 py-3 bg-[#4C811F] text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20 inline-flex items-center gap-2">
            Panelime Git <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  },
  {
    id: 2,
    sender: 'Volty AI Engine',
    subject: 'Haziran Ayı Enerji Tasarruf Raporunuz 📊',
    preview: 'Geçtiğimiz ay Volty sayesinde toplam ₺340 tasarruf ettiniz...',
    date: 'Dün',
    isUnread: true,
    isStarred: false,
    type: 'report',
    content: (
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Aylık Özet Raporu (Haziran 2026)</h2>
        <p className="text-gray-600 font-medium">Tebrikler! Geçen ay sistemin uyguladığı akıllı otomasyonlar sayesinde ciddi bir tasarruf sağladınız.</p>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block mb-2">Tasarruf Edilen Tutar</span>
            <span className="text-4xl font-black text-blue-700">₺340</span>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
            <span className="text-xs font-bold text-green-500 uppercase tracking-wider block mb-2">Karbon Ayak İzi</span>
            <span className="text-4xl font-black text-green-700">-12<span className="text-lg">kg</span></span>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Başarılı Aksiyonlar
          </h4>
          <ul className="space-y-3 text-sm font-medium text-gray-600">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
              Klima gece 02:00'den sonra "Eco" moda alındı. (Toplam 18 gün)
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
              Çamaşır makinesi düşük tarifeli saatlerde (22:00 sonrası) çalıştırıldı.
            </li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 3,
    sender: 'Sistem Uyarıları',
    subject: 'Otomasyon Tetiklendi: Yazlık',
    preview: 'Bütçe sınırına ulaşıldığı için kritik olmayan cihazlar kapatıldı.',
    date: 'Pzt',
    isUnread: false,
    isStarred: false,
    type: 'alert',
    content: (
      <div className="space-y-6">
        <div className="flex items-center gap-4 bg-orange-50 border border-orange-200 p-4 rounded-2xl text-orange-800">
          <AlertTriangle className="w-8 h-8 shrink-0" />
          <div>
            <h4 className="font-bold">Otomasyon Devreye Girdi</h4>
            <p className="text-sm font-medium opacity-90">Lokasyon: Bodrum Yazlık</p>
          </div>
        </div>
        <p className="text-gray-600 font-medium leading-relaxed">
          Belirlediğiniz günlük 15 kWh limitine yaklaşıldığı için saat 14:35 itibariyle sisteme tanımlı <strong>"Kritik Olmayan Cihazlar (Oyun Konsolu, TV, Yedek Klima)"</strong> otomatik olarak standby modundan çıkarılıp tamamen kapatılmıştır.
        </p>
        <p className="text-gray-600 font-medium">
          Bu otomasyonu iptal etmek veya bütçe limitinizi güncellemek istiyorsanız aşağıdaki butonu kullanabilirsiniz.
        </p>
        <div className="pt-4">
          <button className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
            Kuralları Düzenle
          </button>
        </div>
      </div>
    )
  },
  {
    id: 4,
    sender: 'Güvenlik',
    subject: 'Yeni Giriş Algılandı',
    preview: 'Hesabınıza Chrome (Windows) üzerinden yeni bir cihazdan giriş yapıldı.',
    date: '20 Tem',
    isUnread: false,
    isStarred: false,
    type: 'security',
    content: (
      <div className="space-y-6">
        <h2 className="text-xl font-black text-gray-900 mb-2">Yeni Giriş Bildirimi</h2>
        <p className="text-gray-600 font-medium">Hesabınıza yeni bir cihazdan başarılı bir giriş yapıldı.</p>
        
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 font-medium text-sm text-gray-700 space-y-2">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-500">Cihaz:</span>
            <span className="font-bold">Chrome (Windows 11)</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-2">
            <span className="text-gray-500">IP Adresi:</span>
            <span className="font-bold">192.168.1.45</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-gray-500">Tarih:</span>
            <span className="font-bold">20 Temmuz 2026, 15:42</span>
          </div>
        </div>

        <p className="text-sm text-gray-500">Bu işlemi siz gerçekleştirmediyseniz, lütfen hemen şifrenizi değiştirin ve destek ekibiyle iletişime geçin.</p>
      </div>
    )
  }
];

// --- Gerçek uyarı (penalty/anomali) mesajlarını gelen kutusu formatına çevir ---
const CATEGORY_META = {
  BREACH_80: { sender: 'Voltify Kota Uyarısı', title: '%80 Bütçe Kotası Aşıldı', emoji: '⚠️', tone: 'orange' },
  BREACH_100: { sender: 'Voltify Kota Uyarısı', title: '%100 Kota Aşıldı — Ceza Tarifesi Aktif', emoji: '🚨', tone: 'red' },
  ANOMALY_DETECTED: { sender: 'Voltify Anomali', title: 'Cihaz Anomali Uyarısı', emoji: '🔥', tone: 'red' },
};

const formatInboxDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
};

const AlertContent = ({ msg, meta }) => {
  const toneClasses = meta.tone === 'red'
    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-200'
    : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/30 text-orange-800 dark:text-orange-200';
  return (
    <div className="space-y-6">
      <div className={`flex items-center gap-4 p-4 rounded-2xl border ${toneClasses}`}>
        <AlertTriangle className="w-8 h-8 shrink-0" />
        <div>
          <h4 className="font-bold">{meta.emoji} {meta.title}</h4>
          <p className="text-sm font-medium opacity-90">Lokasyon: {msg.homeName || 'Eviniz'}</p>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-[#182119] rounded-2xl p-6 border border-gray-100 dark:border-emerald-950/30">
        <MarkdownText text={msg.body} className="text-gray-700 dark:text-gray-300 font-medium text-sm" />
      </div>
      {msg.emailSent && (
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-green-500" /> Bu uyarı kayıtlı e-posta adresinize de gönderildi.
        </p>
      )}
    </div>
  );
};

const mapAlert = (msg) => {
  const meta = CATEGORY_META[msg.category] || { sender: 'Voltify', title: msg.category || 'Bildirim', emoji: '⚡', tone: 'orange' };
  const body = msg.body || '';
  return {
    id: `alert-${msg.id}`,
    sender: meta.sender,
    subject: `${meta.emoji} ${meta.title}${msg.homeName ? ' — ' + msg.homeName : ''}`,
    preview: body.length > 120 ? body.slice(0, 120) + '…' : body,
    date: formatInboxDate(msg.createdAt),
    isUnread: true,
    isStarred: msg.category === 'BREACH_100',
    type: 'penalty',
    content: <AlertContent msg={msg} meta={meta} />,
  };
};

const Inbox = () => {
  const [alerts, setAlerts] = useState([]);
  const [activeMail, setActiveMail] = useState(mockEmails[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const didAutoSelect = useRef(false);
  const readIds = useRef(new Set());

  // Penalty/anomali uyarılarını backend'den çek, gelen kutusuna düşür, periyodik tazele
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const rows = await inboxService.getMessages();
        if (!active) return;
        const mapped = (Array.isArray(rows) ? rows : []).map(mapAlert);
        mapped.forEach((m) => { if (readIds.current.has(m.id)) m.isUnread = false; });
        setAlerts(mapped);
        if (!didAutoSelect.current && mapped.length > 0) {
          setActiveMail(mapped[0]); // en yeni uyarı otomatik açılsın
          didAutoSelect.current = true;
        }
      } catch (e) {
        // Hata toast'ı api.js interceptor'ında gösterilir
      }
    };
    load();
    const timer = setInterval(load, 20000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const emails = useMemo(() => [...alerts, ...mockEmails], [alerts]);

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-[calc(100vh-140px)] flex bg-white dark:bg-[#1E271F] rounded-3xl border border-gray-100 dark:border-emerald-950/30 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      {/* Left Sidebar (Mail List) */}
      <div className="w-full md:w-1/3 lg:w-[400px] flex flex-col border-r border-gray-100 dark:border-emerald-950/30 bg-gray-50/30 dark:bg-black/10">
        
        {/* Header & Search */}
        <div className="p-6 border-b border-gray-100 dark:border-emerald-950/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <InboxIcon className="w-6 h-6 text-[#4C811F]" />
              Gelen Kutusu
            </h2>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Maillerde ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#182119] border border-gray-200 dark:border-emerald-950/30 rounded-xl font-medium text-sm focus:outline-none focus:border-[#4C811F] text-gray-900 dark:text-white transition-colors"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredEmails.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium text-sm">Sonuç bulunamadı.</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-emerald-950/30">
              {filteredEmails.map(email => (
                <div 
                  key={email.id}
                  onClick={() => {
                    setActiveMail(email);
                    email.isUnread = false; // Yerel olarak okundu işaretle
                    readIds.current.add(email.id); // Tazelemede tekrar okunmadıya dönmesin
                  }}
                  className={`p-5 cursor-pointer transition-colors relative border-l-4 ${
                    activeMail.id === email.id 
                      ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-500' 
                      : 'hover:bg-gray-50 dark:hover:bg-[#2A352B] border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-bold text-sm ${email.isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {email.sender}
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">
                      {email.date}
                    </span>
                  </div>
                  <h5 className={`text-sm mb-1 line-clamp-1 pr-6 ${email.isUnread ? 'font-bold text-gray-900 dark:text-gray-100' : 'font-semibold text-gray-800 dark:text-gray-400'}`}>
                    {email.subject}
                  </h5>
                  <p className={`text-xs line-clamp-2 ${email.isUnread ? 'font-medium text-gray-600 dark:text-gray-300' : 'font-medium text-gray-500 dark:text-gray-500'}`}>
                    {email.preview}
                  </p>

                  {/* Unread Dot */}
                  {email.isUnread && (
                    <div className="absolute top-5 right-5 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Content (Reading Pane) */}
      <div className="hidden md:flex flex-1 flex-col bg-white dark:bg-[#1E271F] overflow-hidden relative">
        {activeMail ? (
          <>
            {/* Top Toolbar */}
            <div className="h-16 border-b border-gray-100 dark:border-emerald-950/30 flex items-center justify-between px-8 shrink-0 bg-white dark:bg-[#1E271F]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#2A352B] flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm uppercase">
                  {activeMail.sender.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{activeMail.sender}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">kime: ben</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full hover:bg-gray-50 dark:hover:bg-[#2A352B] flex items-center justify-center text-gray-400 hover:text-yellow-500 transition-colors">
                  <Star className={`w-5 h-5 ${activeMail.isStarred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                </button>
                <button className="w-10 h-10 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <div className="max-w-2xl mx-auto">
                <div className="mb-10 border-b border-gray-100 dark:border-emerald-950/30 pb-6 flex justify-between items-end">
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight pr-4">
                    {activeMail.subject}
                  </h1>
                  <span className="text-sm font-bold text-gray-400 whitespace-nowrap shrink-0">{activeMail.date}</span>
                </div>

                {/* Rendered HTML Content */}
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  {activeMail.content}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Mail className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-medium">Okumak için bir mail seçin</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Inbox;
