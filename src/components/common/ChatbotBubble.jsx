import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Sparkles,
  RefreshCw,
  Settings,
  Dog,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

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

// Fallback intelligent canine reactivity knowledge base
function generateLocalAiResponse(userMsg, activeDog) {
  const query = userMsg.toLowerCase();
  const dogName = activeDog?.name || 'tu perro';

  if (query.includes('lat') || query.includes('look at that') || query.includes('mirar')) {
    return `El método **Look At That (LAT)** ayuda a ${dogName} a asociar la presencia de un detonante con calma:\n\n1. Detecta el detonante a una **distancia de confort** (antes de que ${dogName} se tensione).\n2. En cuanto ${dogName} mire al detonante, marca inmediatamente con tu clicker o palabra puente (*"¡Sí!"*).\n3. Ofrécele un premio de alto valor.\n4. Repite varias veces hasta que al ver el detonante, volteé a mirarte a ti espontáneamente.`;
  }

  if (query.includes('3 segundo') || query.includes('tres segundo') || query.includes('tiempo')) {
    return `La **Regla de los 3 Segundos** previene la acumulación de tensión:\n\n• Permite que ${dogName} olfatee o mire un estímulo por máximo 3 segundos.\n• Antes del segundo 3, llama su atención suavemente y cambia de dirección.\n• Esto evita la fijación visual de mirada y mantiene su umbral de excitabilidad bajo control.`;
  }

  if (query.includes('premio') || query.includes('comida') || query.includes('recompensa')) {
    return `Para modificar conducta reactiva en ${dogName}, usa **Premios de Grado A (Alto Valor)**:\n\n• Trocitos pequeños de pollo cocido, hígado, salchicha de pavo o queso magro.\n• Deben ser suaves, húmedos y fáciles de tragar rápido sin distractores de masticación.`;
  }

  if (query.includes('reactiv') || query.includes('perro') || query.includes('ladra') || query.includes('jala')) {
    return `Para manejar la reactividad de ${dogName} en el paseo:\n\n1. **Mantén distancia de seguridad**: Aumenta la distancia respecto al estímulo antes de que ladre.\n2. **Tensión en la correa**: Mantén la correa floja pero firme. La tensión en la correa transmite tu ansiedad al perro.\n3. **Redirección Olfativa**: Si se excita, esparce premios en el pasto (*Sembrado de premios*) para bajar sus pulsaciones olfateando.`;
  }

  return `Entendido. Para ${dogName}, recuerda que la clave es la **desensibilización sistemática a la distancia adecuada**. Trabaja siempre por debajo del umbral de excitación y recompensa cada mirada de calma. ¿Te gustaría profundizar en el método LAT, distancia de confort o gestión de detonantes?`;
}

export function ChatbotBubble() {
  const { activeDog } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([DEFAULT_WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Custom Webhook URL state (loads from .env or local storage override)
  const envWebhook = import.meta.env.VITE_CHATBOT_WEBHOOK_URL || '';
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('caniscalm_chatbot_webhook_url') || envWebhook;
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSaveWebhook = (url) => {
    setWebhookUrl(url);
    localStorage.setItem('caniscalm_chatbot_webhook_url', url);
    setShowSettings(false);
  };

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

    // If Webhook URL is configured, send payload to Webhook (n8n / OpenAI / Typebot)
    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            dog_name: activeDog?.name || 'Mascota',
            breed: activeDog?.breed_name || 'Raza',
            history: messages.slice(-6),
          }),
        });

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          const replyText =
            data.reply || data.output || data.message || data.text || JSON.stringify(data);

          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: replyText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          setIsTyping(false);
          return;
        }
      } catch (err) {
        console.warn('Webhook chatbot request failed, using local AI fallback:', err.message);
      }
    }

    // Local AI Fallback response
    setTimeout(() => {
      const localReply = generateLocalAiResponse(text, activeDog);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: localReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Chat Bubble Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-sage-600 to-sage-700 text-white shadow-hover transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/40 cursor-pointer"
          aria-label="Abrir Asistente Canino IA"
          title="Asistente Canino IA (Kira AI)"
        >
          <Bot className="w-7 h-7 transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-terracotta-500 border-2 border-white"></span>
          </span>
          <span className="absolute right-16 bg-sage-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
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
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="w-6 h-6 text-cream-100" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm">Kira AI</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-cream-200">
                  {webhookUrl ? '⚡ Webhook Conectado' : '💡 Asistente Canino Local'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings((prev) => !prev)}
                className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-cream-200"
                title="Configuración de Webhook"
              >
                <Settings className="w-4 h-4" />
              </button>
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

          {/* Settings Panel (Custom Webhook Input) */}
          {showSettings && (
            <div className="bg-sage-50 p-3.5 border-b border-surface-border space-y-2 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sage-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-terracotta-500" /> Enlace de Webhook n8n / IA
                </span>
                <span className="text-[10px] text-ink-muted">Opcional</span>
              </div>
              <input
                type="url"
                placeholder="https://felipe-p90.app.n8n.cloud/webhook/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-surface-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage-400"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSaveWebhook(webhookUrl)}
                  className="px-3 py-1 bg-sage-700 text-white rounded-lg font-bold text-[11px] hover:bg-sage-800 transition-colors cursor-pointer"
                >
                  Guardar Enlace Webhook
                </button>
              </div>
            </div>
          )}

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
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-terracotta-500 text-white rounded-br-none shadow-soft'
                      : 'bg-white border border-surface-border text-sage-900 rounded-bl-none shadow-soft'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[10px] text-ink-muted mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-sage-600 text-xs italic bg-white p-2.5 rounded-2xl rounded-bl-none border border-surface-border w-max animate-pulse">
                <Bot className="w-3.5 h-3.5" /> Escribiendo respuesta...
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
              placeholder="Escribe tu consulta sobre entrenamiento..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-cream-100 border border-surface-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage-400"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isTyping}
              className="p-2 bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer shadow-soft"
              title="Enviar Mensaje"
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
