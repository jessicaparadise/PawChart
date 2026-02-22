import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../utils/api';

const SUGGESTED_QUESTIONS = [
  'Is {name} up to date on vaccinations?',
  'What medications is {name} currently taking?',
  'Are there any upcoming appointments for {name}?',
  'What health conditions does {name} have?',
  'How has {name}\'s weight changed recently?',
  'What should I watch out for with {name}\'s current medications?',
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
        isUser ? 'bg-paw-600 text-white' : 'bg-gradient-to-br from-paw-100 to-paw-300'
      }`}>
        {isUser ? '👤' : '🐾'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'bg-paw-600 text-white rounded-tr-sm'
          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
      }`}>
        {msg.content.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < msg.content.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-paw-100 to-paw-300 flex items-center justify-center text-sm flex-shrink-0">
        🐾
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export default function PetAIChat({ petId, petName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    const messageText = (text || input).trim();
    if (!messageText || loading) return;

    setInput('');
    setError(null);

    const userMsg = { role: 'user', content: messageText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const { reply } = await api.aiChat(petId, messageText, history);
      setMessages([...updatedMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      // Remove the user message on failure so they can retry
      setMessages(messages);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const suggestions = SUGGESTED_QUESTIONS.map(q => q.replace(/{name}/g, petName || 'your pet'));
  const showSuggestions = messages.length === 0;

  return (
    <div className="card flex flex-col" style={{ minHeight: '520px', maxHeight: '620px' }}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4 flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-paw-500 to-paw-700 rounded-xl flex items-center justify-center text-lg shadow-sm">
          🤖
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Ask PawChart AI</h3>
          <p className="text-xs text-gray-400">
            Ask anything about {petName ? `${petName}'s` : 'your pet's'} health records
          </p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          Online
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ minHeight: 0 }}>
        {showSuggestions ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🐾</div>
              <p className="text-gray-700 font-medium">
                Hi! I'm PawChart AI.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                I have access to {petName ? `${petName}'s` : 'your pet's'} health records and can help you understand them.
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-2 px-1">Suggested questions</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-paw-50 hover:bg-paw-100 text-paw-700 border border-paw-200 rounded-full px-3 py-1.5 transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex-shrink-0">
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="mt-4 flex gap-2 flex-shrink-0 border-t border-gray-100 pt-4">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask about ${petName ? `${petName}'s` : 'your pet's'} health...`}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-paw-400 focus:border-transparent placeholder-gray-400"
          style={{ maxHeight: '100px', overflowY: 'auto' }}
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="flex-shrink-0 w-10 h-10 bg-paw-600 hover:bg-paw-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors self-end"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <p className="text-center text-xs text-gray-300 mt-2 flex-shrink-0">
        AI responses are for informational purposes only. Always consult a vet for medical decisions.
      </p>
    </div>
  );
}
