import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, User, GraduationCap, ChevronRight } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface AIChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCourse?: (courseTitle: string) => void;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  isOpen,
  onClose,
  onSelectCourse
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "👋 Namaste! I am Pearl AI Assistant. I can help you choose the right course (DCA, ADCA, Tally GST, Python, Web Dev, MPPSC), explain admission fees, or guide you through online enrollment. What would you like to know?"
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim()) return;

    const userMsg: Message = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });

      const data = await res.json();
      if (data.success && data.response) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: "Pearl Computer & Target Academy offers DCA, ADCA, Tally Prime with GST, Python, MERN Web Dev, and MPPSC Target Coaching. Feel free to fill out the Online Admission form!"
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I am currently offline, but you can explore all courses or contact our helpline at +91 79998-29231 / +91 93292-84693!"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Which course is best after 12th Pass?",
    "Compare DCA vs ADCA course duration & fee",
    "Tell me about Tally Prime with GST course",
    "How to prepare for MPPSC Civil Services?"
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[520px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500 text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Pearl AI Assistant</h3>
            <p className="text-[10px] text-blue-200">Powered by Gemini AI • 24x7 Advisory</p>
          </div>
        </div>

        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic">
            <Bot className="w-4 h-4 animate-bounce text-blue-500" />
            <span>Pearl AI is analyzing course options...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 overflow-x-auto whitespace-nowrap flex gap-1.5 text-[10px]">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 hover:border-blue-500 cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI course question..."
          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
        />
        <button
          onClick={() => handleSend()}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
