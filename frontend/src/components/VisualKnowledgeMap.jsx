import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
          // Default selection to current target or first weak node
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
        Building Visual Knowledge Graph from live student mastery data...
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
          bg: '#ecfdf5',
          border: '#10b981',
          text: '#065f46',
          badgeBg: '#10b981',
          badgeText: '#ffffff',
          icon: '✓',
          label: 'MASTERED (≥75%)'
        };
      case 'CURRENT TARGET':
        return {
          bg: '#eef2ff',
          border: '#6366f1',
          text: '#312e81',
          badgeBg: '#4f46e5',
          badgeText: '#ffffff',
          icon: '🎯',
          label: 'CURRENT TARGET'
        };
      case 'PREREQUISITE GAP':
        return {
          bg: '#fffbeb',
          border: '#f59e0b',
          text: '#92400e',
          badgeBg: '#d97706',
          badgeText: '#ffffff',
          icon: '⚠️',
          label: 'PREREQUISITE GAP'
        };
      case 'WEAK':
        return {
          bg: '#fef2f2',
          border: '#ef4444',
          text: '#991b1b',
          badgeBg: '#dc2626',
          badgeText: '#ffffff',
          icon: '❌',
          label: 'WEAK (<75%)'
        };
      default: // NOT ATTEMPTED
        return {
          bg: '#f8fafc',
          border: '#cbd5e1',
          text: '#475569',
          badgeBg: '#94a3b8',
          badgeText: '#ffffff',
          icon: '○',
          label: 'NOT ATTEMPTED'
        };
    }
  };

  // Group nodes by prerequisite chains for GRAPH view
  const nodesWithPrereqs = filteredNodes.filter(n => n.prerequisiteIds && n.prerequisiteIds.length > 0);
  const rootNodes = filteredNodes.filter(n => !n.prerequisiteIds || n.prerequisiteIds.length === 0);

  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
            <span>🗺️</span> Visual Knowledge Map
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time concept prerequisite network driven strictly by student database performance (75% threshold)
          </p>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setViewMode('GRAPH')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: viewMode === 'GRAPH' ? 'white' : 'transparent',
              color: viewMode === 'GRAPH' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: viewMode === 'GRAPH' ? '700' : '500',
              cursor: 'pointer',
              fontSize: '0.8rem',
              boxShadow: viewMode === 'GRAPH' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            🌿 Prerequisite Tree Flow
          </button>
          <button
            onClick={() => setViewMode('GRID')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: viewMode === 'GRID' ? 'white' : 'transparent',
              color: viewMode === 'GRID' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: viewMode === 'GRID' ? '700' : '500',
              cursor: 'pointer',
              fontSize: '0.8rem',
              boxShadow: viewMode === 'GRID' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            ▦ All Concepts Grid
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
        <span style={{ fontWeight: '700', color: 'var(--text-main)', marginRight: '0.5rem' }}>Status Standards:</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#065f46', fontWeight: '600' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span> MASTERED (≥75%)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#312e81', fontWeight: '600' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4f46e5', display: 'inline-block', boxShadow: '0 0 6px #6366f1' }}></span> CURRENT TARGET
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#92400e', fontWeight: '600' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span> PREREQUISITE GAP
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#991b1b', fontWeight: '600' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span> WEAK (&lt;75%)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#475569', fontWeight: '600' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#94a3b8', display: 'inline-block' }}></span> NOT ATTEMPTED
        </span>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem', maxWidth: '75%' }}>
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '2rem',
                border: activeFilter === s ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: activeFilter === s ? 'var(--primary)' : '#ffffff',
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
          placeholder="🔍 Search concept..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontSize: '0.85rem',
            width: '200px'
          }}
        />
      </div>

      {/* VIEW 1: PREREQUISITE TREE FLOW */}
      {viewMode === 'GRAPH' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '520px', overflowY: 'auto', padding: '0.75rem', backgroundColor: '#fcfcfd', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          {nodesWithPrereqs.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '2rem 0' }}>No multi-step prerequisite chains found for this subject filter.</p>
          ) : (
            nodesWithPrereqs.map(child => {
              const childConf = getStatusConfig(child.status);
              const isChildSelected = selectedNode?.id === child.id;

              return (
                <div key={child.id} style={{
                  padding: '1.25rem',
                  backgroundColor: '#ffffff',
                  border: isChildSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: isChildSelected ? '0 4px 12px rgba(99,102,241,0.15)' : '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                  {/* Subject & Chapter tag */}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{child.subject} • {child.chapter}</span>
                    <span style={{ fontStyle: 'italic' }}>Prerequisite Dependency Chain</span>
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
                              backgroundColor: isParentSelected ? '#eff6ff' : parentConf.bg,
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
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                              Prerequisite Foundation
                            </span>
                            <strong style={{ fontSize: '0.9rem', color: parentConf.text }}>
                              {parent.name}
                            </strong>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '1rem',
                              backgroundColor: parentConf.badgeBg,
                              color: parentConf.badgeText,
                              margin: '0.25rem auto 0'
                            }}>
                              {parentConf.icon} {parent.mastery > 0 ? `${parent.mastery.toFixed(0)}%` : parentConf.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Downward Arrow */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: child.status === 'PREREQUISITE_GAP' ? '#f59e0b' : 'var(--primary)', fontWeight: 'bold' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        ↓ Required to unlock
                      </span>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <polyline points="19 12 12 19 5 12"></polyline>
                      </svg>
                    </div>

                    {/* Target Concept Node */}
                    <div
                      onClick={() => setSelectedNode(child)}
                      style={{
                        padding: '0.75rem 1.25rem',
                        backgroundColor: isChildSelected ? '#eff6ff' : childConf.bg,
                        border: `2px solid ${isChildSelected ? 'var(--primary)' : childConf.border}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        minWidth: '220px',
                        textAlign: 'center',
                        boxShadow: child.status === 'CURRENT TARGET' ? '0 0 12px rgba(99,102,241,0.3)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                        Target Engineering Concept
                      </span>
                      <strong style={{ fontSize: '1rem', color: childConf.text }}>
                        {child.name}
                      </strong>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '1rem',
                        backgroundColor: childConf.badgeBg,
                        color: childConf.badgeText,
                        margin: '0.25rem auto 0'
                      }}>
                        {childConf.icon} {child.mastery > 0 ? `${child.mastery.toFixed(0)}% Mastery` : childConf.label}
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
                  backgroundColor: isSelected ? '#eff6ff' : conf.bg,
                  border: `2px solid ${isSelected ? 'var(--primary)' : conf.border}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  boxShadow: node.status === 'CURRENT TARGET' ? '0 0 10px rgba(99,102,241,0.3)' : (isSelected ? '0 4px 12px rgba(99,102,241,0.2)' : 'none')
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', color: conf.text }}>
                    {node.name}
                  </div>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: '700', 
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
          backgroundColor: '#f8fafc',
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>{selectedNode.name}</h4>
              {(() => {
                const conf = getStatusConfig(selectedNode.status);
                return (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '1rem',
                    backgroundColor: conf.badgeBg,
                    color: conf.badgeText
                  }}>
                    {conf.icon} {selectedNode.mastery > 0 ? `${selectedNode.mastery.toFixed(0)}% Mastery` : conf.label}
                  </span>
                );
              })()}
            </div>

            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Subject: <strong>{selectedNode.subject}</strong> | Chapter: <strong>{selectedNode.chapter}</strong>
            </p>

            {selectedNode.prerequisiteNames && selectedNode.prerequisiteNames.length > 0 && (
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: '#92400e' }}>
                ⚠️ <strong>Requires Prerequisites:</strong> {selectedNode.prerequisiteNames.join(', ')}
              </p>
            )}

            {selectedNode.dependentNames && selectedNode.dependentNames.length > 0 && (
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#065f46' }}>
                🚀 <strong>Unlocks Downstream Topics:</strong> {selectedNode.dependentNames.join(', ')}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to={`/learning/${selectedNode.id}`} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              📖 Start Learning
            </Link>
            <Link to={`/practice/${selectedNode.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              🎯 Practice Now
            </Link>
            <Link to={`/reassessment/${selectedNode.id}`} className="btn btn-success" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              📝 Reassess (≥75%)
            </Link>
            <Link to={`/adaptive-quiz/${selectedNode.id}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              ⚡ Adaptive Quiz
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualKnowledgeMap;
