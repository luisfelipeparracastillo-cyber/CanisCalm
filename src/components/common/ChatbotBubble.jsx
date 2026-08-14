import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, RefreshCw, Dog } from 'lucide-react';

// Exact Flowise AI prediction endpoint requested by user
const FLOWISE_API_URL =
  import.meta.env.VITE_FLOWISE_API_URL ||
  'https://cloud.flowiseai.com/api/v1/prediction/d7442141-a115-48dc-aa61-a97a3e9e1845';

/**
 * Exact query function for Flowise AI Prediction API
 */
async function queryFlowise(data) {
  const response = await fetch(FLOWISE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Servidor de IA respondió con estado ${response.status}`);
  }

  const result = await response.json();
  return result;
}

const INITIAL_WELCOME_MESSAGE = {
  id: 'welcome-1',
  sender: 'bot',
  text: '¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export function ChatbotBubble() {
  const { activeDog } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([INITIAL_WELCOME_MESSAGE]);
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

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = inputMsg.trim();
    if (!text) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMsg('');
    setIsTyping(true);

    try {
      // 1. Call Flowise AI Prediction API with question and dog context
      const dogContext = activeDog?.name
        ? ` [Mascota: ${activeDog.name}, Raza: ${activeDog.breed_name || 'Desconocida'}]`
        : '';
      const fullQuestion = `${text}${dogContext}`;

      const apiResult = await queryFlowise({ question: fullQuestion });

      // 2. Parse text response returned by Flowise AI
      let replyText = '';
      if (typeof apiResult === 'string') {
        replyText = apiResult;
      } else if (apiResult && typeof apiResult === 'object') {
        replyText =
          apiResult.text ||
          apiResult.output ||
          apiResult.reply ||
          apiResult.message ||
          (apiResult.json ? JSON.stringify(apiResult.json) : JSON.stringify(apiResult));
      }

      if (replyText && replyText.trim()) {
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
        throw new Error('La IA respondió pero no envió texto.');
      }
    } catch (err) {
      // Display connection error bubble
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'error',
          text: `Ups, no pude conectarme con el servicio de IA Flowise. (${err.message})`,
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
                  <h3 className="font-bold text-sm">Asistente</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-cream-200">En línea • Flowise AI Conectado</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([INITIAL_WELCOME_MESSAGE])}
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

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
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
