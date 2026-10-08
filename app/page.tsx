'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const CORRECT_PIN = process.env.NEXT_PUBLIC_CONTROL_PIN ?? '0000';

const MODES = [
  { id: 'mode1', label: 'NFL',       icon: '🏈', desc: 'Live scores' },
  { id: 'mode2', label: 'DASHBOARD', icon: '📊', desc: 'Overview' },
  { id: 'mode3', label: 'CLOCK',     icon: '🕐', desc: 'Time display' },
  { id: 'mode4', label: 'STOCKS',    icon: '📈', desc: 'Market data' },
  { id: 'mode5', label: 'MLB',       icon: '⚾', desc: 'Live scores' },
  { id: 'mode6', label: 'TEXT',      icon: '✏️', desc: 'Custom message' },
  { id: 'mode7', label: 'TRAIN',     icon: '🚆', desc: 'CTA Brown Line' },
  { id: 'mode8', label: 'CFB',       icon: '🏟️', desc: 'College scores' },
  { id: 'mode9', label: 'SCREENSAVER', icon: '🌈', desc: 'Nyan cat' },
];

// Modes with a settings panel below the grid
const CONFIGURABLE_MODES = ['mode5', 'mode8'];

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

  const handlePinChange = useCallback((val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    setPin(digits);
    setPinError(false);
    if (digits.length === 4) {
      if (digits === CORRECT_PIN) {
        setUnlocked(true);
      } else {
        setPinError(true);
        setTimeout(() => { setPinError(false); setPin(''); }, 800);
      }
    }
  }, []);

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
    return <PinScreen pin={pin} error={pinError} onChange={handlePinChange} onSubmit={() => handlePinChange(pin)} />;
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
  pin, error, onChange, onSubmit,
}: {
  pin: string; error: boolean; onChange: (val: string) => void; onSubmit: () => void;
}) {
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

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={4}
        value={pin}
        onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
        placeholder="0000"
        style={{
          background: 'var(--surface)',
          border: `1px solid ${error ? '#ff4444' : 'var(--border)'}`,
          borderRadius: '8px',
          color: 'var(--accent)',
          fontSize: '16px',
          textAlign: 'center',
          padding: '1rem 1.5rem',
          width: '100%',
          maxWidth: '280px',
          outline: 'none',
          fontFamily: 'inherit',
          letterSpacing: '0.3em',
        }}
      />

      <button
        onClick={onSubmit}
        style={{
          padding: '0.9rem 2rem',
          background: 'rgba(0,212,255,0.1)',
          border: '1px solid var(--accent)',
          color: 'var(--accent)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.75rem',
          letterSpacing: '0.25em',
          fontFamily: 'inherit',
          fontWeight: 'bold',
          width: '100%',
          maxWidth: '280px',
        }}
      >
        UNLOCK
      </button>

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
        role="button"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsed ? 0 : '0.5rem', cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', userSelect: 'none' }}
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

// ── CFB Filter ────────────────────────────────────────────────────────────────

type CfbFilter = 'all' | 'ranked' | 'teams';
type CfbTeam = { id: string; abbr: string; name: string; conference: string };

const CFB_ACCENT = '#CC6600';

const CFB_FILTER_OPTIONS: { id: CfbFilter; label: string; hint: string }[] = [
  { id: 'all',    label: 'ALL',      hint: 'Every game with a Power 4 (incl. Notre Dame) or ranked team' },
  { id: 'ranked', label: 'RANKED',   hint: 'Games with at least one AP Top 25 team' },
  { id: 'teams',  label: 'MY TEAMS', hint: 'Only your teams · falls back to ranked games on a bye' },
];

function CfbFilterPanel() {
  const [filter, setFilter] = useState<CfbFilter>('ranked');
  const [selected, setSelected] = useState<string[]>([]);
  const [teams, setTeams] = useState<CfbTeam[]>([]);
  const [query, setQuery] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [collapsed, setCollapsed] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/api/cfb-config')
      .then(r => r.json())
      .then(d => {
        if (d.filter) setFilter(d.filter);
        if (Array.isArray(d.teams)) setSelected(d.teams);
      })
      .catch(() => {});
    fetch('/api/cfb-teams')
      .then(r => r.json())
      .then(d => setTeams(d.teams || []))
      .catch(() => {});
  }, []);

  // Every change saves immediately — there's no draft state worth holding
  const save = async (next: { filter?: CfbFilter; teams?: string[] }) => {
    setSaveState('saving');
    try {
      const res = await fetch('/api/cfb-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error('server error');
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaveState('idle'), 1500);
  };

  const pickFilter = (f: CfbFilter) => {
    setFilter(f);
    save({ filter: f });
  };

  const toggleTeam = (id: string) => {
    const next = selected.includes(id) ? selected.filter(t => t !== id) : [...selected, id];
    setSelected(next);
    save({ teams: next });
  };

  const byId = new Map(teams.map(t => [t.id, t]));
  const q = query.trim().toLowerCase();
  const matches = q
    ? teams.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.abbr.toLowerCase().includes(q) ||
        t.conference.toLowerCase().includes(q)
      ).slice(0, 12)
    : [];

  const statusLabel =
    saveState === 'saving' ? 'SAVING…' :
    saveState === 'saved'  ? 'SAVED ✓' :
    saveState === 'error'  ? 'ERROR ✕' :
    filter === 'teams' ? `${selected.length} TEAM${selected.length === 1 ? '' : 'S'}` :
    CFB_FILTER_OPTIONS.find(o => o.id === filter)?.label;

  const chipStyle = (on: boolean) => ({
    padding: '0.3rem 0.5rem',
    fontSize: '0.65rem',
    fontFamily: 'inherit',
    letterSpacing: '0.08em',
    fontWeight: on ? 'bold' : 'normal',
    background: on ? 'rgba(204,102,0,0.15)' : 'transparent',
    border: `1px solid ${on ? CFB_ACCENT : 'var(--border)'}`,
    color: on ? CFB_ACCENT : 'var(--text-muted)',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  } as const);

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${CFB_ACCENT}, transparent)` }} />

      {/* Header — click to collapse */}
      <div
        onClick={() => setCollapsed(v => !v)}
        role="button"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsed ? 0 : '1rem', cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', userSelect: 'none' }}
      >
        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', letterSpacing: '0.2em' }}>
          GAME FILTER
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            color: saveState === 'saved' ? 'var(--success)' : saveState === 'error' ? '#CC0000' : 'var(--text-muted)',
            fontSize: '0.6rem',
          }}>
            {statusLabel}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', transition: 'transform 0.2s', display: 'inline-block', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>
      </div>

      {!collapsed && <>

      {/* Filter segmented control */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '0.5rem' }}>
        {CFB_FILTER_OPTIONS.map(opt => {
          const on = filter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => pickFilter(opt.id)}
              style={{ ...chipStyle(on), padding: '0.6rem 0.25rem', fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '0.12em', boxShadow: on ? '0 0 6px rgba(204,102,0,0.3)' : 'none' }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.08em', marginBottom: filter === 'teams' ? '1rem' : 0 }}>
        {CFB_FILTER_OPTIONS.find(o => o.id === filter)?.hint}
      </div>

      {filter === 'teams' && <>
        {/* Selected teams */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
          {selected.length === 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.08em' }}>
              No teams yet · search below
            </span>
          )}
          {selected.map(id => {
            const team = byId.get(id);
            return (
              <button key={id} onClick={() => toggleTeam(id)} title={team ? `Remove ${team.name}` : 'Remove'} style={chipStyle(true)}>
                {team?.abbr ?? id} ✕
              </button>
            );
          })}
        </div>

        {/* Search */}
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={teams.length ? `Search ${teams.length} FBS teams…` : 'Loading teams…'}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text)',
            fontSize: '16px',
            fontFamily: 'inherit',
            padding: '0.6rem 0.75rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {matches.length > 0 && (
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {matches.map(team => {
              const on = selected.includes(team.id);
              return (
                <button
                  key={team.id}
                  onClick={() => toggleTeam(team.id)}
                  style={{
                    ...chipStyle(on),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.6rem',
                    textAlign: 'left',
                  }}
                >
                  <span>
                    <span style={{ display: 'inline-block', minWidth: '3rem', fontWeight: 'bold' }}>{team.abbr}</span>
                    {team.name}
                  </span>
                  <span style={{ fontSize: '0.55rem', opacity: 0.7 }}>
                    {on ? '✓' : team.conference}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </>}

      </>}
    </div>
  );
}

// ── Text Composer ─────────────────────────────────────────────────────────────

const COLOR_PRESETS = [
  { label: 'AMBER',  value: '0xFFCC00' },
  { label: 'WHITE',  value: '0xFFFFFF' },
  { label: 'CYAN',   value: '0x00D4FF' },
  { label: 'GREEN',  value: '0x00FF66' },
  { label: 'RED',    value: '0xFF2244' },
  { label: 'ORANGE', value: '0xFF6600' },
  { label: 'PINK',   value: '0xFF44AA' },
  { label: 'BLUE',   value: '0x4488FF' },
];

function hexPreviewColor(v: string) {
  return '#' + v.replace('0x', '');
}

function TextComposer() {
  const [text, setText] = useState('');
  const [color, setColor] = useState('0xFFCC00');
  const [bold, setBold] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetch('/api/text')
      .then(r => r.json())
      .then(d => {
        if (d.text  !== undefined) setText(d.text);
        if (d.color !== undefined) setColor(d.color);
        if (d.bold  !== undefined) setBold(d.bold);
      })
      .catch(() => {});
  }, []);

  const send = async () => {
    if (!text.trim() || saveState === 'sending') return;
    setSaveState('sending');
    try {
      const res = await fetch('/api/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), color, bold }),
      });
      if (!res.ok) throw new Error();
      setSaveState('sent');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 2000);
    }
  };

  // Estimate line count using same word-wrap logic as the server.
  // Small font: 4px/char → ~16 chars/line. Bold: ~5px/char → ~12 chars/line.
  const charsPerLine = bold ? 12 : 16;
  const estLines = text.split('\n').reduce((acc, para) => {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) return acc + 1;
    let lineCount = 1, lineLen = 0;
    for (const w of words) {
      if (lineLen && lineLen + 1 + w.length > charsPerLine) { lineCount++; lineLen = w.length; }
      else { lineLen = lineLen ? lineLen + 1 + w.length : w.length; }
    }
    return acc + lineCount;
  }, 0) || 1;
  const willScroll = estLines > 3;

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #CC44FF, transparent)' }} />

      {/* Header */}
      <div
        onClick={() => setCollapsed(v => !v)}
        role="button"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsed ? 0 : '1rem', cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', userSelect: 'none' }}
      >
        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', letterSpacing: '0.2em' }}>
          MESSAGE COMPOSER
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {willScroll && !collapsed && (
            <span style={{ color: '#CC44FF', fontSize: '0.55rem', letterSpacing: '0.1em' }}>↕ SCROLL</span>
          )}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', transition: 'transform 0.2s', display: 'inline-block', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Text input */}
          <div style={{ marginBottom: '1rem' }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                padding: '0.75rem',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
              <span style={{ color: willScroll ? '#CC44FF' : 'var(--text-muted)', fontSize: '0.55rem', letterSpacing: '0.1em' }}>
                {estLines} {estLines === 1 ? 'LINE' : 'LINES'}{willScroll ? ' — ↕ SCROLLS' : ''}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.55rem' }}>{text.length} CHARS</span>
            </div>
          </div>

          {/* Bold toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', letterSpacing: '0.15em' }}>STYLE</span>
            <button
              onClick={() => setBold(v => !v)}
              style={{
                padding: '0.25rem 0.75rem',
                background: bold ? 'rgba(204,68,255,0.15)' : 'transparent',
                border: `1px solid ${bold ? '#CC44FF' : 'var(--border)'}`,
                color: bold ? '#CC44FF' : 'var(--text-muted)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                letterSpacing: '0.1em',
                fontFamily: 'inherit',
              }}
            >
              BOLD
            </button>
          </div>

          {/* Color swatches */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
              COLOR
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {COLOR_PRESETS.map(preset => {
                const isOn = color === preset.value;
                return (
                  <button
                    key={preset.value}
                    onClick={() => setColor(preset.value)}
                    title={preset.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.55rem',
                      background: isOn ? `${hexPreviewColor(preset.value)}22` : 'transparent',
                      border: `1px solid ${isOn ? hexPreviewColor(preset.value) : 'var(--border)'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '0.6rem',
                      letterSpacing: '0.08em',
                      color: isOn ? hexPreviewColor(preset.value) : 'var(--text-muted)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: hexPreviewColor(preset.value),
                      flexShrink: 0,
                      boxShadow: isOn ? `0 0 6px ${hexPreviewColor(preset.value)}` : 'none',
                    }} />
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Send button */}
          <button
            onClick={send}
            disabled={!text.trim() || saveState === 'sending'}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: saveState === 'sent'  ? 'rgba(0,204,102,0.15)'  :
                          saveState === 'error' ? 'rgba(204,0,0,0.15)'    :
                          'rgba(204,68,255,0.1)',
              border: `1px solid ${
                saveState === 'sent'  ? 'var(--success)' :
                saveState === 'error' ? '#CC0000'         :
                '#CC44FF'
              }`,
              color: saveState === 'sent'  ? 'var(--success)' :
                     saveState === 'error' ? '#CC0000'         :
                     '#CC44FF',
              borderRadius: '8px',
              cursor: (!text.trim() || saveState === 'sending') ? 'not-allowed' : 'pointer',
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              fontFamily: 'inherit',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              opacity: !text.trim() ? 0.5 : 1,
            }}
          >
            {saveState === 'sending' ? '...'      :
             saveState === 'sent'    ? 'SENT ✓'   :
             saveState === 'error'   ? 'ERROR ✕'  :
             'SEND TO DISPLAY'}
          </button>
        </>
      )}
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
          const hasSettings = CONFIGURABLE_MODES.includes(mode.id);
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
              {/* Settings gear indicator for modes with a settings panel */}
              {hasSettings && (
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

      {/* CFB filter — shown when CFB mode is active */}
      {currentMode === 'mode8' && <CfbFilterPanel />}

      {/* Text Composer — shown when TEXT mode is active */}
      {currentMode === 'mode6' && <TextComposer />}

      <div style={{ marginTop: 'auto', color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.15em', textAlign: 'center' }}>
        TINYTRON v1.0 // {new Date().getFullYear()}
      </div>
    </main>
  );
}
