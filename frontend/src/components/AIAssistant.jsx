import { useState, useRef, useEffect } from 'react';
import { 
  IconSparkles, 
  IconAlertTriangle, 
  IconBulb, 
  IconBook, 
  IconKey, 
  IconChartBar, 
  IconTarget, 
  IconCopy, 
  IconCheck, 
  IconSend, 
  IconX, 
  IconRefresh 
} from '@tabler/icons-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Helper to categorize markdown headers into structured engineering study sections
function getHeaderMeta(headerText) {
  const cleaned = headerText.replace(/^#+\s*/, '').trim();
  
  // Extract leading emoji if present
  const emojiMatch = cleaned.match(/^([\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]+)\s*(.*)$/u);
  const emoji = emojiMatch ? emojiMatch[1] : null;
  const title = emojiMatch ? emojiMatch[2] : cleaned;
  const lower = title.toLowerCase();

  if (emoji?.includes('💡') || lower.includes('explanation') || lower.includes('concept') || lower.includes('what is') || lower.includes('simple words')) {
    return { icon: IconBulb, title, color: 'var(--primary)' };
  }
  if (emoji?.includes('📌') || lower.includes('example') || lower.includes('analogy') || lower.includes('real-world')) {
    return { icon: IconBook, title, color: 'var(--success)' };
  }
  if (emoji?.includes('🔑') || lower.includes('takeaway') || lower.includes('checklist') || lower.includes('characteristic') || lower.includes('prerequisite')) {
    return { icon: IconKey, title, color: 'var(--primary)' };
  }
  if (emoji?.includes('⚠️') || lower.includes('watch out') || lower.includes('mistake') || lower.includes('pitfall')) {
    return { icon: IconAlertTriangle, title, color: 'var(--warning)' };
  }
  if (emoji?.includes('📊') || lower.includes('diagnosis') || lower.includes('performance') || lower.includes('academic')) {
    return { icon: IconChartBar, title, color: 'var(--primary)' };
  }
  if (emoji?.includes('📝') || lower.includes('practice') || lower.includes('question')) {
    return { icon: IconTarget, title, color: 'var(--success)' };
  }

  return { icon: IconSparkles, title, color: 'var(--primary)' };
}

// Code block with language tag, JetBrains Mono font, and copy button
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      margin: '0.65rem 0',
      borderRadius: 'var(--radius-sm, 6px)',
      backgroundColor: '#0c0d0e',
      border: '1px solid var(--border-color)',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.35rem 0.75rem',
        backgroundColor: '#141618',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '0.72rem',
        color: 'var(--text-muted)'
      }}>
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {language || 'CODE'}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          style={{
            background: 'none',
            border: 'none',
            color: copied ? 'var(--success)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono, monospace)',
            padding: '0.15rem 0.35rem'
          }}
        >
          {copied ? <IconCheck size={14} stroke={2} /> : <IconCopy size={14} stroke={1.75} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre style={{
        margin: 0,
        padding: '0.85rem 1rem',
        fontSize: '0.82rem',
        fontFamily: 'var(--font-mono, monospace)',
        lineHeight: 1.55,
        overflowX: 'auto',
        color: '#f1f5f9',
        whiteSpace: 'pre',
        backgroundColor: '#0a0b0d'
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Structured markdown renderer for engineering study responses
function MarkdownContent({ content }) {
  if (!content) return null;

  const lines = content.split(/\r?\n/);
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLang = '';
  let currentList = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} style={{ margin: '0.35rem 0 0.65rem 1.15rem', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {currentList.map((item, idx) => (
            <li key={idx} style={{ lineHeight: '1.55', fontSize: '0.88rem', color: 'var(--text-main)' }}>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const flushCode = () => {
    if (codeBuffer.length > 0) {
      elements.push(
        <CodeBlock 
          key={`code-${elements.length}`} 
          code={codeBuffer.join('\n')} 
          language={codeLang} 
        />
      );
      codeBuffer = [];
      codeLang = '';
    }
  };

  const renderInline = (str) => {
    if (!str) return '';
    const parts = str.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code 
            key={pIdx} 
            style={{ 
              fontFamily: 'var(--font-mono, monospace)', 
              fontSize: '0.84em', 
              backgroundColor: 'rgba(56, 189, 248, 0.08)', 
              color: 'var(--primary)',
              padding: '0.15rem 0.35rem',
              borderRadius: '4px',
              border: '1px solid rgba(56, 189, 248, 0.2)'
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx} style={{ color: 'var(--text-main)', fontWeight: 650 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block fences
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        flushCode();
      } else {
        flushList();
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Markdown Headers (###, ##, #)
    if (line.trim().startsWith('### ') || line.trim().startsWith('## ') || line.trim().startsWith('# ')) {
      flushList();
      const meta = getHeaderMeta(line);
      elements.push(
        <div key={`h-${i}`} style={{
          margin: elements.length > 0 ? '0.9rem 0 0.45rem' : '0.2rem 0 0.45rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.35rem 0.6rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: '#1a1d20',
          border: '1px solid var(--border-color)'
        }}>
          <span style={{ color: meta.color, display: 'flex', alignItems: 'center' }}>
            <meta.icon size={15} stroke={2} />
          </span>
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
            {renderInline(meta.title)}
          </span>
        </div>
      );
      continue;
    }

    // Sub-header (####)
    if (line.trim().startsWith('#### ')) {
      flushList();
      const subTitle = line.replace(/^####\s*/, '').trim();
      elements.push(
        <div key={`h4-${i}`} style={{
          margin: '0.65rem 0 0.3rem',
          fontSize: '0.82rem',
          fontWeight: 650,
          color: 'var(--text-main)'
        }}>
          {renderInline(subTitle)}
        </div>
      );
      continue;
    }

    // Bullet points (- or * or numbered list)
    if (/^(\s*[-*]|\s*\d+\.)\s+/.test(line)) {
      const itemText = line.replace(/^(\s*[-*]|\s*\d+\.)\s+/, '').trim();
      currentList.push(itemText);
      continue;
    }

    // Empty lines act as separators
    if (!line.trim()) {
      flushList();
      continue;
    }

    // Standard paragraph line
    flushList();
    elements.push(
      <p key={`p-${i}`} style={{ margin: '0 0 0.6rem 0', lineHeight: '1.6', fontSize: '0.88rem', color: 'var(--text-main)' }}>
        {renderInline(line)}
      </p>
    );
  }

  flushList();
  flushCode();

  return <div style={{ display: 'flex', flexDirection: 'column' }}>{elements}</div>;
}

function AIAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentConceptId, setCurrentConceptId] = useState(null);
  const [currentConceptName, setCurrentConceptName] = useState(null);
  const [lastSentText, setLastSentText] = useState('');
  
  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: "### Welcome to SmartLearn AI Tutor\nI am your engineering study assistant. I help you understand complex concepts, diagnose prerequisite gaps, and achieve **≥75% mastery** across your syllabus.\n\n**How I can help:**\n- Understand difficult algorithms, proofs, and definitions\n- Trace prerequisite gaps when you make a mistake\n- Practice targeted questions before your assessment\n- Advise on what to learn next based on your mastery profile\n\nAsk a question below or choose a suggested study action." 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleOpenAI = (e) => {
      setIsOpen(true);
      if (e.detail?.conceptId) {
        setCurrentConceptId(e.detail.conceptId);
      }
      if (e.detail?.conceptName) {
        setCurrentConceptName(e.detail.conceptName);
      }
      if (e.detail?.prompt) {
        setTimeout(() => handleSend(e.detail.prompt, e.detail.conceptId, e.detail.conceptName), 100);
      }
    };
    
    window.addEventListener('open-ai-assistant', handleOpenAI);
    return () => window.removeEventListener('open-ai-assistant', handleOpenAI);
  }, []);

  // Keyboard shortcut: Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, errorMessage]);

  const handleSend = async (textToSend = input, contextId = currentConceptId, contextName = currentConceptName) => {
    const query = (textToSend || '').trim();
    if (!query) return;
    
    setLastSentText(query);
    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    setInput('');
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.post('/ai/chat', { 
        message: query,
        studentId: user?.id || 1,
        currentConceptId: contextId,
        contextConceptId: contextId
      });
      
      if (res.data.available === false) {
        setErrorMessage(res.data.response || "AI Tutor is temporarily unavailable.");
        setMessages(prev => prev.slice(0, -1));
        setInput(query);
      } else {
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: res.data.response || res.data,
          context: contextName 
        }]);
      }
    } catch (err) {
      console.error("AI chat error", err);
      setErrorMessage("AI Tutor couldn't complete that response. Try again in a moment.");
      setMessages(prev => prev.slice(0, -1));
      setInput(query);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastSentText) {
      handleSend(lastSentText, currentConceptId, currentConceptName);
    }
  };

  const suggestedPrompts = [
    "What should I learn next?",
    "Why am I struggling with this?",
    "Explain this concept simply",
    "Give me a real-world example",
    "What are common mistakes to avoid?",
    "Give me practice for my weakest topic"
  ];

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="ai-fab"
          aria-label="Open AI Tutor"
        >
          <IconSparkles size={22} stroke={1.75} />
        </button>
      )}

      {isOpen && (
        <>
          <div 
            className="ai-modal-backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="ai-assistant-modal" role="dialog" aria-modal="true" aria-label="SmartLearn AI Tutor Workspace">
            {/* Mobile Sheet Drag Handle */}
            <div className="ai-bottom-sheet-handle" style={{ display: 'none', width: '36px', height: '4px', borderRadius: '2px', backgroundColor: 'var(--border-color)', margin: '0.5rem auto 0' }} />

            {/* Header */}
            <div style={{
              padding: '0.95rem 1.25rem', 
              borderBottom: '1px solid var(--border-color)',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              backgroundColor: '#141618',
              color: 'var(--text-main)',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  border: '1px solid var(--border-color)'
                }}>
                  <IconSparkles size={18} stroke={1.75} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                    AI Tutor
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                    Engineering study assistant
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)} 
                aria-label="Close AI Tutor"
                style={{ 
                  background: 'none', 
                  border: '1px solid transparent', 
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem', 
                  cursor: 'pointer', 
                  color: 'var(--text-muted)', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconX size={18} stroke={2} />
              </button>
            </div>

            {/* Contextual Concept Strip */}
            {currentConceptName && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 1rem',
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                borderBottom: '1px solid var(--border-color)',
                fontSize: '0.78rem',
                color: 'var(--text-main)',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <IconTarget size={15} stroke={2} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-muted)' }}>Target Concept:</span>
                  <strong style={{ color: 'var(--primary)', fontWeight: 600 }}>{currentConceptName}</strong>
                </div>
                <button
                  onClick={() => { setCurrentConceptId(null); setCurrentConceptName(null); }}
                  aria-label="Clear active context"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.15rem 0.25rem',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Clear concept context"
                >
                  <IconX size={13} stroke={2} />
                </button>
              </div>
            )}

            {/* Message Conversation List */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '1.1rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem', 
              backgroundColor: '#0c0d0e' 
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: msg.sender === 'user' ? '84%' : '100%',
                  padding: msg.sender === 'user' ? '0.7rem 0.95rem' : '0.95rem 1.15rem',
                  borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  backgroundColor: msg.sender === 'user' ? '#1a1d20' : '#141618',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '0.88rem',
                  lineHeight: '1.55'
                }}>
                  {msg.sender === 'user' ? (
                    <div>
                      <div style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-muted)',
                        marginBottom: '0.25rem',
                        fontFamily: 'var(--font-mono, monospace)'
                      }}>
                        You
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.65rem',
                        paddingBottom: '0.45rem',
                        borderBottom: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>
                          <IconSparkles size={14} stroke={2} />
                          <span>AI TUTOR</span>
                        </div>
                        {msg.context && (
                          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', backgroundColor: '#0c0d0e', padding: '0.15rem 0.4rem', borderRadius: '3px', border: '1px solid var(--border-color)' }}>
                            {msg.context}
                          </span>
                        )}
                      </div>
                      <MarkdownContent content={msg.text} />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Thinking / Analyzing Indicator */}
              {loading && (
                <div style={{ 
                  alignSelf: 'flex-start',
                  padding: '0.75rem 1rem', 
                  backgroundColor: '#141618',
                  borderRadius: '12px 12px 12px 2px', 
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', animation: 'dotPulse 1.2s infinite ease-in-out' }} />
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', animation: 'dotPulse 1.2s infinite ease-in-out 0.2s' }} />
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', animation: 'dotPulse 1.2s infinite ease-in-out 0.4s' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}>AI Tutor is thinking...</span>
                </div>
              )}
              
              {/* Error State Banner */}
              {errorMessage && (
                <div style={{ 
                  margin: '0.4rem 0',
                  padding: '0.85rem 1rem',
                  backgroundColor: 'var(--danger-bg)', 
                  border: '1px solid var(--danger)',
                  borderRadius: 'var(--radius-md)', 
                  color: 'var(--danger-text)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 650 }}>
                    <IconAlertTriangle size={16} stroke={2} style={{ color: 'var(--danger)' }} />
                    <span>AI Tutor couldn't complete that response</span>
                  </div>
                  <div style={{ color: 'var(--text-main)', fontSize: '0.82rem' }}>
                    {errorMessage}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <button 
                      onClick={handleRetry} 
                      style={{
                        padding: '0.35rem 0.75rem',
                        backgroundColor: '#141618',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <IconRefresh size={13} stroke={2} />
                      Try again
                    </button>
                    <button 
                      onClick={() => setErrorMessage(null)} 
                      style={{
                        padding: '0.35rem 0.65rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.78rem'
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input & Suggested Prompts Strip */}
            <div style={{ 
              padding: '0.75rem 1rem', 
              borderTop: '1px solid var(--border-color)', 
              backgroundColor: '#141618',
              flexShrink: 0
            }}>
              {/* Suggested Prompts */}
              <div style={{ 
                display: 'flex', 
                gap: '0.4rem', 
                overflowX: 'auto', 
                paddingBottom: '0.45rem', 
                marginBottom: '0.55rem' 
              }} className="hide-scrollbar">
                {suggestedPrompts.map(prompt => (
                  <button 
                    key={prompt} 
                    onClick={() => handleSend(prompt)} 
                    disabled={loading}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#0f1012',
                      color: 'var(--text-muted)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.color = 'var(--primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.backgroundColor = '#0f1012';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Study Prompt Box */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                backgroundColor: '#0c0d0e',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.35rem 0.5rem 0.35rem 0.85rem'
              }}
              className="ai-input-wrapper"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about a concept, review a mistake, or what to learn next..."
                  aria-label="Ask AI Tutor a question"
                  style={{ 
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.88rem',
                    backgroundColor: 'transparent',
                    color: 'var(--text-main)',
                    padding: '0.4rem 0'
                  }}
                  disabled={loading}
                />
                <button 
                  onClick={() => handleSend()} 
                  disabled={loading || !input.trim()} 
                  aria-label="Send message to AI Tutor"
                  className="btn btn-primary"
                  style={{ 
                    padding: '0.45rem 0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    minWidth: '36px',
                    height: '34px'
                  }}
                >
                  <IconSend size={16} stroke={2} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .ai-input-wrapper:focus-within {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 1px var(--primary);
        }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </>
  );
}

export default AIAssistant;
