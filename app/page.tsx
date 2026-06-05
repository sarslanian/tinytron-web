'use client';

import { useState, useEffect, useCallback } from 'react';

const CORRECT_PIN = process.env.NEXT_PUBLIC_CONTROL_PIN ?? '0000';

const MODES = [
  { id: 'mode1', label: 'NFL',       icon: '🏈', desc: 'Live scores' },
  { id: 'mode2', label: 'DASHBOARD', icon: '📊', desc: 'Overview' },
  { id: 'mode3', label: 'CLOCK',     icon: '🕐', desc: 'Time display' },
  { id: 'mode4', label: 'STOCKS',    icon: '📈', desc: 'Market data' },
  { id: 'mode5', label: 'MLB',       icon: '⚾', desc: 'Live scores' },
];

const MLB_TEAMS = [
  { id: 109, abbr: 'ARI', name: 'Arizona Diamondbacks' },
  { id: 144, abbr: 'ATL', name: 'Atlanta Braves' },
  { id: 110, abbr: 'BAL', name: 'Baltimore Orioles' },
  { id: 111, abbr: 'BOS', name: 'Boston Red Sox' },
  { id: 112, abbr: 'CHC', name: 'Chicago Cubs' },
  { id: 145, abbr: 'CWS', name: 'Chicago White Sox' },
  { id: 113, abbr: 'CIN', name: 'Cincinnati Reds' },
  { id: 114, abbr: 'CLE', name: 'Cleveland Guardians' },
  { id: 115, abbr: 'COL', name: 'Colorado Rockies' },
  { id: 116, abbr: 'DET', name: 'Detroit Tigers' },
  { id: 117, abbr: 'HOU', name: 'Houston Astros' },
  { id: 118, abbr: 'KC',  name: 'Kansas City Royals' },
  { id: 108, abbr: 'LAA', name: 'Los Angeles Angels' },
  { id: 119, abbr: 'LAD', name: 'Los Angeles Dodgers' },
  { id: 146, abbr: 'MIA', name: 'Miami Marlins' },
  { id: 158, abbr: 'MIL', name: 'Milwaukee Brewers' },
  { id: 142, abbr: 'MIN', name: 'Minnesota Twins' },
  { id: 121, abbr: 'NYM', name: 'New York Mets' },
  { id: 147, abbr: 'NYY', name: 'New York Yankees' },
  { id: 133, abbr: 'OAK', name: 'Athletics' },
  { id: 143, abbr: 'PHI', name: 'Philadelphia Phillies' },
  { id: 134, abbr: 'PIT', name: 'Pittsburgh Pirates' },
  { id: 135, abbr: 'SD',  name: 'San Diego Padres' },
  { id: 137, abbr: 'SF',  name: 'San Francisco Giants' },
  { id: 136, abbr: 'SEA', name: 'Seattle Mariners' },
  { id: 138, abbr: 'STL', name: 'St. Louis Cardinals' },
  { id: 139, abbr: 'TB',  name: 'Tampa Bay Rays' },
  { id: 140, abbr: 'TEX', name: 'Texas Rangers' },
  { id: 141, abbr: 'TOR', name: 'Toronto Blue Jays' },
  { id: 120, abbr: 'WSH', name: 'Washington Nationals' },
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

  return (
    <ControlPanel
      currentMode={currentMode}
      switching={switching}
      lastUpdated={lastUpdated}
      onSwitch={switchMode}
    />
  );
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

// ── MLB Team Selector ─────────────────────────────────────────────────────────

function MlbTeamSelector() {
  const [selected, setSelected] = useState<number[]>([]);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetch('/api/mlb-teams')
      .then(r => r.json())
      .then(d => setSelected(d.teams || []))
      .catch(() => {});
  }, []);

  const toggle = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
    setSaveState('idle');
  };

  const save = async () => {
    setSaveState('saving');
    try {
      const res = await fetch('/api/mlb-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teams: selected }),
      });
      if (!res.ok) throw new Error('server error');
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 2000);
    }
  };

  const selectAll  = () => { setSelected(MLB_TEAMS.map(t => t.id)); setSaveState('idle'); };
  const clearAll   = () => { setSelected([]); setSaveState('idle'); };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #0099CC, transparent)' }} />

      {/* Header — always visible, click to collapse */}
      <div
        onClick={() => setCollapsed(v => !v)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsed ? 0 : '0.5rem', cursor: 'pointer' }}
      >
        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', letterSpacing: '0.2em' }}>
          TEAM FILTER
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>
            {selected.length === 0 ? 'ALL TEAMS' : `${selected.length} SELECTED`}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', transition: 'transform 0.2s', display: 'inline-block', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>
      </div>

      {!collapsed && (
      <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.08em', marginBottom: '1rem' }}>
        Select teams to show · leave empty for all 30 teams
      </div>
      )}

      {/* Collapsible body */}
      {!collapsed && <>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {[
          { label: 'ALL', action: selectAll },
          { label: 'CLEAR', action: clearAll },
        ].map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              borderRadius: '4px',
              padding: '0.2rem 0.6rem',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.6rem', alignSelf: 'center' }}>
          {selected.length === 0 ? 'ALL TEAMS' : `${selected.length} SELECTED`}
        </div>
      </div>

      {/* Team chips grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem', position: 'relative' }}>
        {MLB_TEAMS.map(team => {
          const isOn = selected.includes(team.id);
          return (
            <button
              key={team.id}
              onClick={() => toggle(team.id)}
              onMouseEnter={() => setTooltip(team.name)}
              onMouseLeave={() => setTooltip(null)}
              onTouchStart={() => setTooltip(team.name)}
              onTouchEnd={() => setTimeout(() => setTooltip(null), 1200)}
              title={team.name}
              style={{
                padding: '0.3rem 0.5rem',
                fontSize: '0.65rem',
                fontFamily: 'inherit',
                letterSpacing: '0.08em',
                fontWeight: isOn ? 'bold' : 'normal',
                background: isOn ? 'rgba(0,153,204,0.15)' : 'transparent',
                border: `1px solid ${isOn ? '#0099CC' : 'var(--border)'}`,
                color: isOn ? '#0099CC' : 'var(--text-muted)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: isOn ? '0 0 6px rgba(0,153,204,0.3)' : 'none',
                minWidth: '2.6rem',
                textAlign: 'center',
              }}
            >
              {team.abbr}
            </button>
          );
        })}

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '0.25rem 0.6rem',
            fontSize: '0.65rem',
            color: 'var(--text)',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            marginBottom: '4px',
            zIndex: 10,
          }}>
            {tooltip}
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={save}
        disabled={saveState === 'saving'}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: saveState === 'saved'  ? 'rgba(0,204,102,0.15)' :
                      saveState === 'error'  ? 'rgba(204,0,0,0.15)'   :
                      'rgba(0,153,204,0.1)',
          border: `1px solid ${
            saveState === 'saved'  ? 'var(--success)' :
            saveState === 'error'  ? '#CC0000'         :
            '#0099CC'
          }`,
          color: saveState === 'saved'  ? 'var(--success)' :
                 saveState === 'error'  ? '#CC0000'         :
                 '#0099CC',
          borderRadius: '8px',
          cursor: saveState === 'saving' ? 'not-allowed' : 'pointer',
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          fontFamily: 'inherit',
          fontWeight: 'bold',
          transition: 'all 0.2s',
        }}
      >
        {saveState === 'saving' ? '...'     :
         saveState === 'saved'  ? 'SAVED ✓' :
         saveState === 'error'  ? 'ERROR ✕' :
         'SAVE'}
      </button>

      </>}
    </div>
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
          const isMlb = mode.id === 'mode5';
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
              {/* Settings gear indicator for MLB */}
              {isMlb && (
                <div style={{
                  position: 'absolute', bottom: '0.75rem', right: '0.75rem',
                  fontSize: '0.6rem', color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  opacity: 0.7,
                }}>
                  ⚙
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* MLB Team Filter — always visible when MLB is active */}
      {currentMode === 'mode5' && <MlbTeamSelector />}

      <div style={{ marginTop: 'auto', color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.15em', textAlign: 'center' }}>
        TINYTRON v1.0 // {new Date().getFullYear()}
      </div>
    </main>
  );
}
