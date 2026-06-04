'use client';

import { useState, useEffect, useCallback } from 'react';

const CORRECT_PIN = process.env.NEXT_PUBLIC_CONTROL_PIN ?? '0000';

const MODES = [
  { id: 'mode1', label: 'NFL', icon: '🏈', desc: 'Live scores' },
  { id: 'mode2', label: 'DASHBOARD', icon: '📊', desc: 'Overview' },
  { id: 'mode3', label: 'CLOCK', icon: '🕐', desc: 'Time display' },
  { id: 'mode4', label: 'STOCKS', icon: '📈', desc: 'Market data' },
];

export default function Home() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [currentMode, setCurrentMode] = useState<string | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMode = useCallback(async () => {
    try {
      const res = await fetch('/api/mode');
      const data = await res.json();
      setCurrentMode(data.mode);
      setLastUpdated(new Date());
    } catch {
      // silently fail — server may be unreachable
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    fetchMode();
    const interval = setInterval(fetchMode, 5000);
    return () => clearInterval(interval);
  }, [unlocked, fetchMode]);

  function handlePinDigit(digit: string) {
    if (pinError) {
      setPinError(false);
      setPin(digit);
      return;
    }
    const next = pin + digit;
    if (next.length < 4) {
      setPin(next);
    } else {
      if (next === CORRECT_PIN) {
        setUnlocked(true);
      } else {
        setPinError(true);
        setPin(next);
        setTimeout(() => { setPinError(false); setPin(''); }, 800);
      }
    }
  }

  function handlePinDelete() {
    setPinError(false);
    setPin(p => p.slice(0, -1));
  }

  async function switchMode(modeId: string) {
    if (switching) return;
    setSwitching(modeId);
    try {
      await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: modeId }),
      });
      setCurrentMode(modeId);
    } finally {
      setSwitching(null);
    }
  }

  if (!unlocked) {
    return <PinScreen pin={pin} error={pinError} onDigit={handlePinDigit} onDelete={handlePinDelete} />;
  }

  return <ControlPanel currentMode={currentMode} switching={switching} lastUpdated={lastUpdated} onSwitch={switchMode} />;
}

// ── PIN Screen ────────────────────────────────────────────────────────────────

function PinScreen({
  pin, error, onDigit, onDelete,
}: {
  pin: string; error: boolean; onDigit: (d: string) => void; onDelete: () => void;
}) {
  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--accent)', fontSize: '0.75rem', letterSpacing: '0.3em', marginBottom: '0.5rem' }}>
          TINYTRON // CONTROL INTERFACE
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '0.15em' }}>
          AUTHENTICATION REQUIRED
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: '1rem', height: '1rem', borderRadius: '50%',
            border: `2px solid ${error ? '#ff4444' : 'var(--border)'}`,
            background: pin.length > i ? (error ? '#ff4444' : 'var(--accent)') : 'transparent',
            transition: 'all 0.15s',
            boxShadow: pin.length > i && !error ? '0 0 8px var(--accent)' : 'none',
          }} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', width: '100%', maxWidth: '280px' }}>
        {digits.map((d, i) => (
          d === '' ? <div key={i} /> :
          <button
            key={i}
            onClick={() => d === '⌫' ? onDelete() : onDigit(d)}
            style={{
              padding: '1.25rem',
              fontSize: d === '⌫' ? '1.25rem' : '1.5rem',
              fontFamily: 'inherit',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: d === '⌫' ? 'var(--text-muted)' : 'var(--text)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.1s',
              letterSpacing: '0.05em',
            }}
            onMouseDown={e => { (e.currentTarget.style.background = 'var(--border)'); (e.currentTarget.style.color = 'var(--accent)'); }}
            onMouseUp={e => { (e.currentTarget.style.background = 'var(--surface)'); (e.currentTarget.style.color = d === '⌫' ? 'var(--text-muted)' : 'var(--text)'); }}
            onTouchStart={e => { (e.currentTarget.style.background = 'var(--border)'); (e.currentTarget.style.color = 'var(--accent)'); }}
            onTouchEnd={e => { (e.currentTarget.style.background = 'var(--surface)'); (e.currentTarget.style.color = d === '⌫' ? 'var(--text-muted)' : 'var(--text)'); }}
          >
            {d}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ color: '#ff4444', fontSize: '0.7rem', letterSpacing: '0.2em' }}>
          ACCESS DENIED
        </div>
      )}
    </main>
  );
}

// ── Control Panel ─────────────────────────────────────────────────────────────

function ControlPanel({
  currentMode, switching, lastUpdated, onSwitch,
}: {
  currentMode: string | null;
  switching: string | null;
  lastUpdated: Date | null;
  onSwitch: (mode: string) => void;
}) {
  const activeMode = MODES.find(m => m.id === currentMode);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1.5rem', maxWidth: '480px', margin: '0 auto', width: '100%' }}>
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <div style={{ color: 'var(--accent)', fontSize: '0.7rem', letterSpacing: '0.3em' }}>
          TINYTRON // CONTROL INTERFACE
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '0.25rem', letterSpacing: '0.1em' }}>
          {lastUpdated ? `SYNC ${lastUpdated.toLocaleTimeString()}` : 'CONNECTING...'}
        </div>
      </div>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
          ACTIVE MODE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--success)',
            boxShadow: '0 0 8px var(--success)',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.1em', color: 'var(--accent)' }}>
            {activeMode ? activeMode.label : currentMode ?? '—'}
          </span>
          {activeMode && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{activeMode.desc}</span>
          )}
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>

      <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', letterSpacing: '0.2em' }}>
        SELECT MODE
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {MODES.map(mode => {
          const isActive = currentMode === mode.id;
          const isLoading = switching === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSwitch(mode.id)}
              disabled={!!switching}
              style={{
                background: isActive ? 'rgba(0,212,255,0.1)' : 'var(--surface)',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '12px',
                padding: '1.25rem 1rem',
                cursor: switching ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isActive ? '0 0 20px rgba(0,212,255,0.15)' : 'none',
                opacity: switching && !isActive ? 0.5 : 1,
              }}
            >
              {isActive && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />
              )}
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{mode.icon}</div>
              <div style={{
                fontFamily: 'inherit',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                letterSpacing: '0.15em',
                color: isActive ? 'var(--accent)' : 'var(--text)',
                marginBottom: '0.25rem',
              }}>
                {isLoading ? '...' : mode.label}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                {mode.desc}
              </div>
              {isActive && (
                <div style={{
                  position: 'absolute', top: '0.75rem', right: '0.75rem',
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: 'var(--success)',
                  boxShadow: '0 0 6px var(--success)',
                }} />
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.15em', textAlign: 'center' }}>
        TINYTRON v1.0 // {new Date().getFullYear()}
      </div>
    </main>
  );
}
