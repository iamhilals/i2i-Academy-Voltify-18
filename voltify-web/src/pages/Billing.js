import React, { useState } from 'react';
import { CreditCard, FileText, Download, CheckCircle2, AlertCircle, ArrowRight, Zap, ShieldCheck, MapPin, Filter } from 'lucide-react';

const mockInvoices = [
  { id: 'INV-2026-07-A', month: 'Temmuz 2026', amount: '850.00', status: 'unpaid', dueDate: '30.07.2026', usage: '210 kWh', home: 'Villa i2i' },
  { id: 'INV-2026-07-B', month: 'Temmuz 2026', amount: '600.00', status: 'unpaid', dueDate: '30.07.2026', usage: '200 kWh', home: 'Merkez Ofis' },
  { id: 'INV-2026-06-A', month: 'Haziran 2026', amount: '820.50', status: 'paid', dueDate: '30.06.2026', usage: '205 kWh', home: 'Villa i2i' },
  { id: 'INV-2026-06-B', month: 'Haziran 2026', amount: '460.00', status: 'paid', dueDate: '30.06.2026', usage: '160 kWh', home: 'Merkez Ofis' },
  { id: 'INV-2026-05-A', month: 'Mayıs 2026', amount: '750.75', status: 'paid', dueDate: '30.05.2026', usage: '190 kWh', home: 'Villa i2i' },
  { id: 'INV-2026-05-C', month: 'Mayıs 2026', amount: '400.00', status: 'paid', dueDate: '30.05.2026', usage: '130 kWh', home: 'Bodrum Yazlık' },
];

const homes = ['Tümü', 'Villa i2i', 'Merkez Ofis', 'Bodrum Yazlık'];

const Billing = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedHome, setSelectedHome] = useState('Tümü');

  const handlePayClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
    setIsSuccess(false);
    setIsProcessing(false);
  };

  const simulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setShowPaymentModal(false);
      }, 2000);
    }, 2000);
  };

  const filteredInvoices = selectedHome === 'Tümü' 
    ? mockInvoices 
    : mockInvoices.filter(i => i.home === selectedHome);

  const totalUnpaid = filteredInvoices
    .filter(i => i.status === 'unpaid')
    .reduce((acc, curr) => acc + parseFloat(curr.amount.replace(',', '')), 0);

  // Get the most urgent unpaid invoice for the selected context
  const nextInvoice = filteredInvoices.find(i => i.status === 'unpaid');

  return (
    <div className="w-full flex flex-col animate-in fade-in zoom-in-95 duration-300 pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <CreditCard className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-gray-900">Faturalarım</h1>
          </div>
          <p className="text-gray-500 font-medium">Ödemelerinizi ve geçmiş faturalarınızı yönetin.</p>
        </div>

        {/* Home Filter Dropdown */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
          <select 
            value={selectedHome}
            onChange={(e) => setSelectedHome(e.target.value)}
            className="pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
          >
            {homes.map(home => (
              <option key={home} value={home}>{home}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Balance Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-gray-900/20">
            {/* Background pattern */}
            <div className="absolute -right-10 -top-10 opacity-10">
              <CreditCard className="w-48 h-48 transform rotate-12" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-2 flex items-center gap-2">
                {selectedHome === 'Tümü' ? 'Toplam Borcunuz' : `${selectedHome} Borcu`}
              </h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-black">₺{totalUnpaid.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-300">Son Ödeme Tarihi</span>
                  <span className="text-sm font-bold text-white">{nextInvoice ? nextInvoice.dueDate : '--.--.----'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">Ödenecek Fatura</span>
                  <span className="text-sm font-bold text-white">{nextInvoice ? nextInvoice.month : 'Borç Yok'}</span>
                </div>
              </div>

              <button 
                onClick={() => nextInvoice && handlePayClick(nextInvoice)}
                disabled={!nextInvoice}
                className="w-full bg-[#4C811F] hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                {nextInvoice ? <><ArrowRight className="w-5 h-5" /> Hemen Öde</> : <><CheckCircle2 className="w-5 h-5" /> Ödenecek Fatura Yok</>}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Güvenli Ödeme</h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">256-bit SSL ile korunmaktadır</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Invoices List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">
                {selectedHome === 'Tümü' ? 'Tüm Geçmiş Faturalar' : `${selectedHome} Faturaları`}
              </h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredInvoices.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-medium">Bu lokasyon için henüz fatura bulunmuyor.</div>
              ) : (
                filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors group">
                    
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                        invoice.status === 'paid' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                      }`}>
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-lg">{invoice.month}</h4>
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {invoice.home}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                          <span>{invoice.id}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {invoice.usage}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                      <div className="text-right">
                        <p className="text-xl font-black text-gray-900">₺{invoice.amount}</p>
                        {invoice.status === 'paid' ? (
                          <p className="text-xs font-bold text-green-600 flex items-center justify-end gap-1 mt-1">
                            <CheckCircle2 className="w-3 h-3" /> Ödendi
                          </p>
                        ) : (
                          <p className="text-xs font-bold text-red-600 flex items-center justify-end gap-1 mt-1">
                            <AlertCircle className="w-3 h-3" /> Son Ödeme: {invoice.dueDate}
                          </p>
                        )}
                      </div>
                      
                      {invoice.status === 'paid' ? (
                        <button className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 hover:text-gray-900 transition-colors" title="PDF İndir">
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handlePayClick(invoice)}
                          className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-sm transition-colors text-sm"
                        >
                          Öde
                        </button>
                      )}
                    </div>
                    
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Payment Modal (Sahte Ödeme Ekranı) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => !isProcessing && setShowPaymentModal(false)} />
          <div className="bg-white w-full max-w-md rounded-3xl p-8 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Ödeme Başarılı!</h2>
                <p className="text-gray-500 font-medium">₺{selectedInvoice?.amount} tutarındaki faturanız başarıyla ödendi.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black text-gray-900">Güvenli Ödeme</h2>
                  <button onClick={() => !isProcessing && setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-900">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{selectedInvoice?.home}</p>
                    <p className="text-lg font-bold text-gray-900">{selectedInvoice?.month}</p>
                  </div>
                  <span className="text-2xl font-black text-gray-900">₺{selectedInvoice?.amount}</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Kart Numarası</label>
                    <input type="text" placeholder="**** **** **** ****" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#4C811F] outline-none font-medium" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Son Kullanma</label>
                      <input type="text" placeholder="AA/YY" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#4C811F] outline-none font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">CVV</label>
                      <input type="text" placeholder="***" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#4C811F] outline-none font-medium" />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={simulatePayment}
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#4C811F] hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Ödemeyi Tamamla <CheckCircle2 className="w-5 h-5" /></>
                  )}
                </button>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

// Helper for X icon in modal
const X = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default Billing;
