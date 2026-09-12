import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/api/admin/messages');
      setMessages(res.data.messages);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/api/admin/messages/${id}`);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
      if (selected?.id === id) setSelected(prev => ({ ...prev, read: true }));
    } catch {}
  };

  const deleteMessage = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await api.delete(`/api/admin/messages/${id}`);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {}
  };

  const unreadCount = messages.filter(m => !m.read).length;

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', padding: '60px'}}><div className="loading-spinner"></div></div>;
  }

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
        <div>
          <h1 style={{fontSize: '1.8rem'}}>Messages</h1>
          <p style={{color: 'var(--text-light)'}}>{unreadCount} unread</p>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '24px'}}>
        <div className="card" style={{overflow: 'hidden'}}>
          {messages.length === 0 ? (
            <div style={{padding: '60px', textAlign: 'center', color: 'var(--text-light)'}}>No messages yet</div>
          ) : (
            <div style={{maxHeight: '70vh', overflowY: 'auto'}}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => { setSelected(msg); if (!msg.read) markRead(msg.id); }}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: selected?.id === msg.id ? 'var(--secondary)' : !msg.read ? '#f0f7ff' : 'transparent',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px'}}>
                    <span style={{fontWeight: !msg.read ? 700 : 500}}>{msg.name}</span>
                    <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px'}}>{msg.email}</p>
                  <p style={{fontSize: '0.9rem', fontWeight: !msg.read ? 600 : 400}}>{msg.subject}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="card" style={{padding: '32px', position: 'sticky', top: '20px', alignSelf: 'start'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px'}}>
              <div>
                <h2 style={{fontSize: '1.3rem', marginBottom: '4px'}}>{selected.subject}</h2>
                <p style={{color: 'var(--text-light)', fontSize: '0.9rem'}}>From: {selected.name} ({selected.email})</p>
                <p style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => deleteMessage(selected.id)} style={{background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.9rem', padding: '4px 8px'}}>Delete</button>
            </div>
            <div style={{padding: '20px', background: 'var(--secondary)', borderRadius: 'var(--radius)', lineHeight: 1.7, whiteSpace: 'pre-wrap'}}>
              {selected.message}
            </div>
            <div style={{marginTop: '20px', padding: '12px', background: 'var(--secondary)', borderRadius: 'var(--radius)', fontSize: '0.85rem'}}>
              <strong>Reply to:</strong> <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} style={{color: 'var(--primary)'}}>{selected.email}</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
