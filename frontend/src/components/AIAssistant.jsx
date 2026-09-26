import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentConceptId, setCurrentConceptId] = useState(null);
  
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! I am SmartLearn AI Tutor, your engineering education assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpenAI = (e) => {
      setIsOpen(true);
      if (e.detail?.conceptId) {
        setCurrentConceptId(e.detail.conceptId);
      }
      if (e.detail?.prompt) {
        // Automatically send the suggested prompt if provided
        setTimeout(() => handleSend(e.detail.prompt, e.detail.conceptId), 100);
      }
    };
    
    window.addEventListener('open-ai-assistant', handleOpenAI);
    return () => window.removeEventListener('open-ai-assistant', handleOpenAI);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, errorMessage]);

  const handleSend = async (textToSend = input, contextId = currentConceptId) => {
    if (!textToSend.trim()) return;
    
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setInput('');
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.post('/ai/chat', { 
        message: textToSend,
        studentId: 1,
        currentConceptId: contextId,
        contextConceptId: contextId
      });
      
      if (res.data.available === false) {
        setErrorMessage(res.data.response || "AI service is currently unavailable.");
        // Pop the user message back into the input so they don't lose it if they want to retry later
        setMessages(prev => prev.slice(0, -1));
        setInput(textToSend);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: res.data.response || res.data }]);
      }
    } catch (err) {
      console.error("AI chat error", err);
      setErrorMessage("An unexpected error occurred connecting to the backend.");
      setMessages(prev => prev.slice(0, -1));
      setInput(textToSend);
    }
    setLoading(false);
  };

  const suggestedPrompts = [
    "What should I learn next?",
    "Why am I struggling with this?",
    "Which prerequisite should I study?",
    "Explain this concept based on my weak areas.",
    "Give me practice for my weakest concept.",
    "Explain this concept simply",
    "What are the common mistakes?"
  ];

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="ai-fab"
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem',
            width: '60px', height: '60px', borderRadius: '50%',
            backgroundColor: 'var(--primary)', color: 'white',
            border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '1.8rem', cursor: 'pointer', zIndex: 999,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}
        >
          ✨
        </button>
      )}

      {isOpen && (
        <div className="ai-assistant-modal" style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          width: '400px', height: '600px', maxWidth: 'calc(100vw - 2rem)', maxHeight: 'calc(100vh - 2rem)',
          backgroundColor: 'white', borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 1000,
          display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border-color)'
        }}>
          <div style={{
            padding: '1.25rem', borderBottom: '1px solid var(--border-color)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)',
            color: 'white'
          }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <span>✨</span> SmartLearn AI Tutor
            </h3>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'white' }}>×</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f8fafc' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%', padding: '0.85rem 1rem', borderRadius: '1rem',
                backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'white',
                color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                border: msg.sender === 'ai' ? '1px solid var(--border-color)' : 'none',
                boxShadow: 'var(--shadow-sm)',
                whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.5'
              }}>
                {msg.text}
              </div>
            ))}
            
            {loading && (
              <div style={{ alignSelf: 'flex-start', padding: '0.75rem 1rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                <span className="typing-indicator">...</span>
              </div>
            )}
            
            {errorMessage && (
              <div style={{ 
                margin: '1rem 0', padding: '1rem', backgroundColor: '#fef2f2', 
                border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', 
                color: '#991b1b', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                  <span>⚠️</span> Error
                </div>
                <div>{errorMessage}</div>
                <button 
                  onClick={() => setErrorMessage(null)} 
                  style={{ alignSelf: 'flex-start', padding: '0.4rem 0.8rem', background: '#fca5a5', border: 'none', borderRadius: '4px', color: '#7f1d1d', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                >
                  Dismiss
                </button>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.5rem' }} className="hide-scrollbar">
              {suggestedPrompts.map(prompt => (
                <button key={prompt} onClick={() => handleSend(prompt)} style={{
                  whiteSpace: 'nowrap', padding: '0.4rem 0.8rem', borderRadius: '2rem',
                  border: '1px solid var(--primary)', backgroundColor: 'transparent',
                  color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem'
                }}>
                  {prompt}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }}
                disabled={loading}
              />
              <button onClick={() => handleSend()} className="btn" disabled={loading || !input.trim()} style={{ padding: '0.75rem 1rem' }}>
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .typing-indicator { font-weight: bold; font-size: 1.2rem; letter-spacing: 2px; animation: blink 1.4s infinite both; }
        @keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
      `}</style>
    </>
  );
}

export default AIAssistant;
