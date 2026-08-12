import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, RefreshCw, Dog } from 'lucide-react';

// Hardcoded Webhook URL pointing to user n8n Chatbot Workflow
const CHATBOT_WEBHOOK_URL =
  import.meta.env.VITE_CHATBOT_WEBHOOK_URL ||
  'https://felipe-p90.app.n8n.cloud/webhook-test/caniscalm-chatbot';

const DEFAULT_WELCOME_MESSAGE = {
  id: 'welcome-1',
  sender: 'bot',
  text: '¡Hola! Soy Kira AI, tu asistente en entrenamiento reactivo canino. ¿En qué puedo ayudarte hoy durante tus paseos o entrenamiento?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const QUICK_QUESTIONS = [
  '🐶 ¿Cómo reduzco la reactividad a otros perros?',
  '👁️ ¿Qué es el método LAT (Look At That)?',
  '⏱️ ¿Cómo aplico la regla de los 3 segundos?',
  '🍖 ¿Qué premios de alto valor debo usar?',
];

export function ChatbotBubble() {
  const { activeDog } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([DEFAULT_WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMsg).trim();
    if (!text) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setIsTyping(true);

    try {
      // 1. Send HTTP POST payload exclusively to n8n Webhook
      const response = await fetch(CHATBOT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: text,
          message: text,
          dog_name: activeDog?.name || 'Mascota',
          breed: activeDog?.breed_name || 'Raza',
          history: messages.slice(-6),
        }),
      });

      if (!response.ok) {
        throw new Error(`El servidor de n8n respondió con estado ${response.status}`);
      }

      // 2. Extract n8n response text / JSON
      const rawText = await response.text();
      let replyText = rawText;

      try {
        const jsonData = JSON.parse(rawText);
        replyText =
          jsonData.reply ||
          jsonData.output ||
          jsonData.message ||
          jsonData.text ||
          (typeof jsonData === 'string' ? jsonData : rawText);
      } catch (e) {
        // Keeps raw text response
      }

      if (replyText && typeof replyText === 'string' && replyText.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('El flujo de n8n respondió pero no envió texto en la respuesta.');
      }
    } catch (err) {
      // Show explicit connection error bubble (NO DEFAULT/MOCK FALLBACK RESPONSES)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'error',
          text: `Ups, no pude conectarme. Revisa que el flujo de n8n esté activo y que la URL sea correcta. (${err.message})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[99999] font-sans">
      {/* Floating Chat Bubble Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-sage-600 via-sage-700 to-terracotta-600 text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white cursor-pointer ring-4 ring-sage-500/20"
          aria-label="Abrir Asistente Canino IA"
          title="Asistente Canino IA (Kira AI)"
        >
          <span className="text-2xl transition-transform group-hover:rotate-12 drop-shadow">🤖</span>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-terracotta-500 border-2 border-white shadow"></span>
          </span>
          <span className="absolute right-20 bg-sage-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-sage-700">
            🐕 ¿Dudas de entrenamiento? ¡Pregúntame!
          </span>
        </button>
      )}

      {/* Floating Chat Window Modal */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[520px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-surface-border flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-sage-700 to-sage-800 text-white p-4 flex items-center justify-between shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 text-xl">
                🤖
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm">Asistente Kira AI</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-cream-200">En línea • n8n Webhook Conectado</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([DEFAULT_WELCOME_MESSAGE])}
                className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-cream-200"
                title="Limpiar Conversación"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white"
                title="Cerrar Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Pet Context Banner */}
          <div className="bg-sage-50/60 px-4 py-1.5 border-b border-surface-border flex items-center justify-between text-[11px] text-ink-secondary">
            <span className="flex items-center gap-1">
              <Dog className="w-3.5 h-3.5 text-sage-600" /> Mascota activa: <strong>{activeDog?.name || 'Kira'}</strong>
            </span>
            <span className="text-terracotta-600 font-semibold">{activeDog?.breed_name || 'Pastor Alemán'}</span>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-cream-50/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-terracotta-500 text-white rounded-br-none shadow-soft'
                      : msg.sender === 'error'
                      ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-bl-none shadow-soft'
                      : 'bg-white border border-surface-border text-sage-900 rounded-bl-none shadow-soft'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[10px] text-ink-muted mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-sage-600 text-xs bg-white p-3 rounded-2xl rounded-bl-none border border-surface-border w-max shadow-soft">
                <span className="w-2 h-2 rounded-full bg-sage-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-sage-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-sage-600 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Chips */}
          <div className="p-2 border-t border-surface-border bg-white overflow-x-auto flex gap-1.5 scrollbar-none">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-full bg-sage-50 hover:bg-sage-100 border border-sage-200 text-sage-800 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-surface-border flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Escribe tu mensaje…"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-cream-100 border border-surface-border rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-sage-400"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isTyping}
              className="w-10 h-10 bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white rounded-full transition-all cursor-pointer shadow-soft flex items-center justify-center flex-none"
              title="Enviar"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatbotBubble;
