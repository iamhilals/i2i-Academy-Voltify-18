import React, { useState, useEffect, useRef } from 'react';
import { X, Brain, Send, Mic, Sparkles, MoreHorizontal, User, Trash2 } from 'lucide-react';
import { aiService } from '../services/aiService';

const mockChatHistory = [
  { id: 1, sender: 'volty', text: 'Merhaba! Ben Volty ⚡ Akıllı enerji asistanınızım. Size nasıl yardımcı olabilirim?' }
];

const ChatbotSlideover = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState(mockChatHistory);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'tr-TR';
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Tarayıcınız ses tanıma özelliğini desteklemiyor. Lütfen Chrome kullanın.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle overlay click to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const promptText = inputText.trim();
    if (!promptText) return;

    // Add user message
    const newUserMsg = {
      id: Date.now(),
      sender: 'user',
      text: promptText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await aiService.sendMessage(promptText);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'volty',
        text: response.reply || 'Enerji asistanınız şu an yanıt veremiyor.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.error("AI Chatbot hatası:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'volty',
        text: 'Üzgünüm, şu an sunucu ile iletişim kurulurken bir sorun oluştu. Lütfen tekrar deneyin.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-500 z-[60] ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleOverlayClick}
      />

      {/* Slideover Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[450px] bg-white dark:bg-[#181F19] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-[70] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-24 bg-gradient-to-r from-[#4C811F] to-[#2D5A10] px-6 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
            <Sparkles className="w-48 h-48 -mr-10 -mt-10 text-white" />
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-green-200">
                <Brain className="w-6 h-6 text-[#4C811F]" />
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="text-xl font-black text-white leading-tight">Volty AI</h2>
              <p className="text-green-100 text-xs font-medium">Enerji Asistanınız • Çevrimiçi</p>
            </div>
          </div>
          
          <div className="flex gap-2 relative z-10">
            {messages.length > 1 && (
              <button 
                onClick={() => setMessages(mockChatHistory)}
                title="Sohbeti Temizle"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-transparent space-y-6">
          
          <div className="text-center pb-4">
            <span className="px-3 py-1 bg-gray-100 dark:bg-[#2A352B] text-gray-500 dark:text-gray-400 rounded-full text-[10px] font-bold uppercase tracking-wider">Bugün</span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className="shrink-0 mt-auto">
                  {msg.sender === 'volty' ? (
                    <div className="w-8 h-8 bg-green-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center border border-green-200 dark:border-emerald-900/50">
                      <Brain className="w-4 h-4 text-green-700 dark:text-green-500" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-900/50">
                      <User className="w-4 h-4 text-blue-700 dark:text-blue-500" />
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col gap-1">
                  <div 
                    className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-gray-900 dark:bg-[#4C811F] text-white rounded-br-sm' 
                        : 'bg-white dark:bg-[#1E271F] text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-emerald-950/30 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                    
                    {/* Action Button inside Volty's message */}
                    {msg.isActionable && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button className="w-full py-2.5 bg-[#4C811F] hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md">
                          Evet, Otomatik Uygula
                        </button>
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold text-gray-400 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.time}
                  </span>
                </div>

              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="shrink-0 mt-auto">
                  <div className="w-8 h-8 bg-green-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center border border-green-200 dark:border-emerald-900/50">
                    <Brain className="w-4 h-4 text-green-700 dark:text-green-500" />
                  </div>
                </div>
                <div className="px-5 py-4 bg-white dark:bg-[#1E271F] border border-gray-100 dark:border-emerald-950/30 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-[#1E271F] border-t border-gray-100 dark:border-emerald-950/30">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 bg-gray-50 dark:bg-[#2A352B] border border-gray-200 dark:border-emerald-950/50 rounded-full px-2 py-2 focus-within:border-gray-900 dark:focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-gray-900/10 dark:focus-within:ring-emerald-500/10 transition-all"
          >
            <button 
              type="button"
              onClick={toggleListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                  : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-emerald-900/30'
              }`}
              title={isListening ? "Dinleniyor... (Durdurmak için tıklayın)" : "Sesle yaz"}
            >
              <Mic className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              placeholder="Volty'ye bir soru sor..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-full bg-[#4C811F] text-white flex items-center justify-center disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition-colors shrink-0 shadow-md"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Voltify AI Engine v2.0
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default ChatbotSlideover;
