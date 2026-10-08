import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  IconMap, 
  IconTools, 
  IconLayoutGrid, 
  IconCircleCheck, 
  IconAlertTriangle, 
  IconTarget, 
  IconBook, 
  IconBrain, 
  IconSparkles, 
  IconArrowRight, 
  IconCheck 
} from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const VisualKnowledgeMap = ({ selectedSubject = 'ALL', studentId }) => {
  const { user } = useAuth();
  const activeStudentId = studentId || user?.id || 1;
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(selectedSubject);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('GRAPH'); // 'GRAPH' or 'GRID'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/students/${activeStudentId}/knowledge-map`)
      .then(res => {
        setData(res.data);
        if (res.data.nodes?.length > 0) {
          const target = res.data.nodes.find(n => n.status === 'CURRENT TARGET') 
                      || res.data.nodes.find(n => n.status === 'PREREQUISITE GAP')
                      || res.data.nodes[0];
          setSelectedNode(target);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading knowledge map", err);
        setLoading(false);
      });
  }, [activeStudentId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
        Building visual knowledge graph from live student mastery data...
      </div>
    );
  }

  const subjects = ['ALL', 'Database Management', 'Data Structures', 'Java', 'Python', 'React.js', 'Automata Theory', 'Mathematics'];

  const filteredNodes = data.nodes.filter(n => {
    const matchesSubject = activeFilter === 'ALL' || n.subject === activeFilter;
    const matchesSearch = !searchQuery || n.name.toLowerCase().includes(searchQuery.toLowerCase()) || (n.chapter && n.chapter.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  const nodeMap = new Map(data.nodes.map(n => [n.id, n]));

  const getStatusConfig = (status) => {
    switch (status) {
      case 'MASTERED':
        return {
          bg: 'var(--success-bg)',
          border: 'var(--success)',
          text: 'var(--success-text)',
          badgeBg: 'var(--success)',
          badgeText: '#ffffff',
          label: 'Mastered (≥75%)'
        };
      case 'CURRENT TARGET':
        return {
          bg: 'var(--primary-light)',
          border: 'var(--primary)',
          text: 'var(--primary)',
          badgeBg: 'var(--primary)',
          badgeText: '#ffffff',
          label: 'Current target'
        };
      case 'PREREQUISITE GAP':
        return {
          bg: 'var(--warning-bg)',
          border: 'var(--warning)',
          text: 'var(--warning-text)',
          badgeBg: 'var(--warning)',
          badgeText: '#ffffff',
          label: 'Prerequisite gap'
        };
      case 'WEAK':
        return {
          bg: 'var(--danger-bg)',
          border: 'var(--danger)',
          text: 'var(--danger-text)',
          badgeBg: 'var(--danger)',
          badgeText: '#ffffff',
          label: 'Weak (<75%)'
        };
      default: // NOT ATTEMPTED
        return {
          bg: 'var(--bg-color)',
          border: 'var(--border-color)',
          text: 'var(--text-muted)',
          badgeBg: 'var(--text-muted)',
          badgeText: '#ffffff',
          label: 'Not attempted'
        };
    }
  };

  // Group nodes by prerequisite chains for GRAPH view
  const nodesWithPrereqs = filteredNodes.filter(n => n.prerequisiteIds && n.prerequisiteIds.length > 0);

  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
            <IconMap size={22} stroke={1.75} style={{ color: 'var(--primary)' }} /> Visual knowledge map
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time concept prerequisite network driven strictly by student database performance (75% threshold standard)
          </p>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-color)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setViewMode('GRAPH')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: viewMode === 'GRAPH' ? 'var(--card-bg)' : 'transparent',
              color: viewMode === 'GRAPH' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: viewMode === 'GRAPH' ? '700' : '500',
              cursor: 'pointer',
              fontSize: '0.8rem',
              boxShadow: viewMode === 'GRAPH' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <IconTools size={14} stroke={1.75} />
            Prerequisite tree flow
          </button>
          <button
            onClick={() => setViewMode('GRID')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: viewMode === 'GRID' ? 'var(--card-bg)' : 'transparent',
              color: viewMode === 'GRID' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: viewMode === 'GRID' ? '700' : '500',
              cursor: 'pointer',
              fontSize: '0.8rem',
              boxShadow: viewMode === 'GRID' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <IconLayoutGrid size={14} stroke={1.75} />
            All concepts grid
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', alignItems: 'center' }}>
        <span style={{ fontWeight: '700', color: 'var(--text-main)', marginRight: '0.25rem' }}>Status standards:</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--success-text)', fontWeight: '600' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span> Mastered (≥75%)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', fontWeight: '600' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', boxShadow: '0 0 5px var(--primary)' }}></span> Current target
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--warning-text)', fontWeight: '600' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }}></span> Prerequisite gap
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--danger-text)', fontWeight: '600' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)' }}></span> Weak (&lt;75%)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontWeight: '600' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }}></span> Not attempted
        </span>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', width: '100%', maxWidth: '100%', minWidth: 0 }}>
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem', width: '100%', maxWidth: '100%', minWidth: 0 }} className="hide-scrollbar">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '2rem',
                border: activeFilter === s ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: activeFilter === s ? 'var(--primary)' : 'var(--card-bg)',
                color: activeFilter === s ? 'white' : 'var(--text-main)',
                fontSize: '0.8rem',
                fontWeight: activeFilter === s ? '600' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search concepts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-main)',
            fontSize: '0.82rem',
            maxWidth: '240px',
            width: '100%',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* VIEW 1: PREREQUISITE GRAPH TREE VIEW */}
      {viewMode === 'GRAPH' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '520px', overflowY: 'auto', padding: '0.5rem' }}>
          {nodesWithPrereqs.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '2rem 0', fontSize: '0.88rem' }}>No multi-step prerequisite chains found for this subject filter.</p>
          ) : (
            nodesWithPrereqs.map(child => {
              const childConf = getStatusConfig(child.status);
              const isChildSelected = selectedNode?.id === child.id;

              return (
                <div key={child.id} style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--card-bg)',
                  border: isChildSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: isChildSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                }}>
                  {/* Subject & Chapter tag */}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{child.subject} • {child.chapter}</span>
                    <span style={{ fontStyle: 'italic' }}>Prerequisite dependency chain</span>
                  </div>

                  {/* Flowchart Diagram: Parent Prerequisite -> Target Concept */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Parent Prerequisite Nodes */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {child.prerequisiteIds.map(pid => {
                        const parent = nodeMap.get(pid);
                        if (!parent) return null;
                        const parentConf = getStatusConfig(parent.status);
                        const isParentSelected = selectedNode?.id === parent.id;

                        return (
                          <div
                            key={parent.id}
                            onClick={() => setSelectedNode(parent)}
                            style={{
                              padding: '0.6rem 1rem',
                              backgroundColor: isParentSelected ? 'var(--primary-light)' : parentConf.bg,
                              border: `2px solid ${isParentSelected ? 'var(--primary)' : parentConf.border}`,
                              borderRadius: 'var(--radius-md)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                              minWidth: '180px',
                              textAlign: 'center'
                            }}
                          >
                            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                              Prerequisite Foundation
                            </span>
                            <strong style={{ fontSize: '0.88rem', color: parentConf.text }}>
                              {parent.name}
                            </strong>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              fontFamily: 'JetBrains Mono, monospace',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '1rem',
                              backgroundColor: parentConf.badgeBg,
                              color: parentConf.badgeText,
                              margin: '0.25rem auto 0'
                            }}>
                              {parent.mastery > 0 ? `${parent.mastery.toFixed(0)}%` : parentConf.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Downward Arrow */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: child.status === 'PREREQUISITE_GAP' ? 'var(--warning)' : 'var(--primary)', fontWeight: 'bold' }}>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '-2px', color: 'var(--text-muted)' }}>Required for</span>
                      <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>↓</span>
                    </div>

                    {/* Child / Target Node */}
                    <div
                      onClick={() => setSelectedNode(child)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: isChildSelected ? 'var(--primary-light)' : childConf.bg,
                        border: `2px solid ${isChildSelected ? 'var(--primary)' : childConf.border}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        minWidth: '220px',
                        boxShadow: child.status === 'CURRENT TARGET' ? '0 0 12px var(--primary-light)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Target Engineering Concept
                      </span>
                      <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: childConf.text, marginTop: '0.2rem' }}>
                        {child.name}
                      </div>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        fontFamily: 'JetBrains Mono, monospace',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '1rem',
                        backgroundColor: childConf.badgeBg,
                        color: childConf.badgeText,
                        margin: '0.25rem auto 0'
                      }}>
                        {child.mastery > 0 ? `${child.mastery.toFixed(0)}% Mastery` : childConf.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: ALL CONCEPTS GRID */}
      {viewMode === 'GRID' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', maxHeight: '480px', overflowY: 'auto', padding: '0.5rem' }}>
          {filteredNodes.map(node => {
            const conf = getStatusConfig(node.status);
            const isSelected = selectedNode?.id === node.id;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{
                  padding: '1rem',
                  backgroundColor: isSelected ? 'var(--primary-light)' : conf.bg,
                  border: `2px solid ${isSelected ? 'var(--primary)' : conf.border}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  boxShadow: node.status === 'CURRENT TARGET' ? '0 0 10px var(--primary-light)' : (isSelected ? 'var(--shadow-md)' : 'none')
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.92rem', color: conf.text }}>
                    {node.name}
                  </div>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: '700', 
                    fontFamily: 'JetBrains Mono, monospace',
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '1rem', 
                    backgroundColor: conf.badgeBg, 
                    color: conf.badgeText,
                    whiteSpace: 'nowrap'
                  }}>
                    {node.mastery > 0 ? `${node.mastery.toFixed(0)}%` : conf.label}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {node.subject} • {node.chapter}
                </div>

                {node.prerequisiteNames && node.prerequisiteNames.length > 0 && (
                  <div style={{ fontSize: '0.75rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px dashed ' + conf.border, color: conf.text }}>
                    <strong>Prerequisites:</strong> {node.prerequisiteNames.join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Node Details & Action Drawer */}
      {selectedNode && (
        <div style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--bg-color)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>{selectedNode.name}</h4>
              {(() => {
                const conf = getStatusConfig(selectedNode.status);
                return (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    fontFamily: 'JetBrains Mono, monospace',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '1rem',
                    backgroundColor: conf.badgeBg,
                    color: conf.badgeText
                  }}>
                    {selectedNode.mastery > 0 ? `${selectedNode.mastery.toFixed(0)}% Mastery` : conf.label}
                  </span>
                );
              })()}
            </div>

            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Subject: <strong>{selectedNode.subject}</strong> | Chapter: <strong>{selectedNode.chapter}</strong>
            </p>

            {selectedNode.prerequisiteNames && selectedNode.prerequisiteNames.length > 0 && (
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: 'var(--warning-text)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <IconAlertTriangle size={15} stroke={2} />
                <span><strong>Requires prerequisites:</strong> {selectedNode.prerequisiteNames.join(', ')}</span>
              </p>
            )}

            {selectedNode.dependentNames && selectedNode.dependentNames.length > 0 && (
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <IconArrowRight size={15} stroke={2} />
                <span><strong>Unlocks downstream topics:</strong> {selectedNode.dependentNames.join(', ')}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to={`/learning/${selectedNode.id}`} className="btn" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
              <IconBook size={15} stroke={1.75} /> Start learning
            </Link>
            <Link to={`/practice/${selectedNode.id}`} className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
              <IconTarget size={15} stroke={1.75} /> Practice
            </Link>
            <Link to={`/reassessment/${selectedNode.id}`} className="btn btn-success" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
              <IconCircleCheck size={15} stroke={1.75} /> Reassess (≥75%)
            </Link>
            <Link to={`/adaptive-quiz/${selectedNode.id}`} className="btn btn-outline" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
              <IconBrain size={15} stroke={1.75} /> Adaptive quiz
            </Link>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', {
                detail: {
                  conceptId: selectedNode.id,
                  prompt: `Can you explain the concept "${selectedNode.name}" and help me understand its core principles?`
                }
              }))}
              className="btn btn-secondary" 
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
            >
              <IconSparkles size={15} stroke={1.75} style={{ color: 'var(--primary)' }} /> Ask AI tutor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualKnowledgeMap;
