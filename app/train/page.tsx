'use client';

import { useState, useEffect, useCallback } from 'react';

interface TrainArrival {
  run: string;
  dest: string;
  destShort: string;
  minutes: number;
  approaching: boolean;
  delayed: boolean;
}

interface CTAData {
  kimball: TrainArrival[];
  loop: TrainArrival[];
  fetchedAt: string;
  error?: string;
}

function MinuteBadge({ train }: { train: TrainArrival }) {
  const isDue = train.approaching || train.minutes === 0;
  const isNear = train.minutes <= 2 && !isDue;

  const bg = train.delayed
    ? 'rgba(255,60,60,0.15)'
    : isDue
    ? 'rgba(0,255,136,0.15)'
    : isNear
    ? 'rgba(255,200,0,0.15)'
    : 'rgba(0,212,255,0.08)';

  const border = train.delayed
    ? '#ff3c3c'
    : isDue
    ? 'var(--success)'
    : isNear
    ? '#ffc800'
    : 'var(--border)';

  const color = train.delayed
    ? '#ff3c3c'
    : isDue
    ? 'var(--success)'
    : isNear
    ? '#ffc800'
    : 'var(--accent)';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '10px',
      padding: '0.6rem 0.9rem',
      minWidth: '72px',
      boxShadow: isDue ? `0 0 14px ${border}44` : 'none',
    }}>
      <span style={{
        fontSize: isDue ? '1.1rem' : '2rem',
        fontWeight: '900',
        color,
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>
        {train.delayed ? 'DLY' : isDue ? 'DUE' : train.minutes}
      </span>
      {!train.delayed && !isDue && (
        <span style={{ fontSize: '0.55rem', color, letterSpacing: '0.15em', marginTop: '2px', opacity: 0.8 }}>MIN</span>
      )}
    </div>
  );
}

function DirectionPanel({
  label,
  color,
  trains,
}: {
  label: string;
  color: string;
  trains: TrainArrival[];
}) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${color}44`,
      borderRadius: '16px',
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }} />

      {/* direction label */}
      <div style={{
        fontSize: '0.6rem',
        letterSpacing: '0.3em',
        color: `${color}cc`,
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 8px ${color}`,
        }} />
        TO {label}
      </div>

      {trains.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
          NO DATA
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {trains.slice(0, 4).map((train, i) => (
            <div key={train.run + i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: i === 0 ? '1.6rem' : '1rem',
                  fontWeight: '900',
                  color: i === 0 ? 'var(--text)' : 'var(--text-muted)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}>
                  {train.dest.toUpperCase()}
                </div>
                <div style={{
                  fontSize: '0.55rem',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.15em',
                  marginTop: '2px',
                }}>
                  RUN #{train.run}
                </div>
              </div>
              <MinuteBadge train={train} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrainDashboard() {
  const [data, setData] = useState<CTAData | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/cta');
      const json = await res.json();
      setData(json);
      setLastFetch(new Date());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const nextKimball = data?.kimball[0];
  const nextLoop = data?.loop[0];

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
      gap: '1.25rem',
      maxWidth: '480px',
      margin: '0 auto',
      width: '100%',
    }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <div style={{
            fontSize: '1.6rem',
            fontWeight: '900',
            color: 'var(--accent)',
            letterSpacing: '-0.02em',
          }}>
            BROWN LINE
          </div>
          <div style={{
            fontSize: '0.6rem',
            letterSpacing: '0.25em',
            color: 'var(--text-muted)',
            paddingBottom: '2px',
          }}>
            CTA TRAIN
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '0.25rem',
        }}>
          <div style={{
            width: '14px',
            height: '14px',
            borderRadius: '3px',
            background: '#7B3F00',
            border: '1px solid #A0522D',
          }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', letterSpacing: '0.15em' }}>
            BELMONT / STOP 40710
          </span>
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
            {lastFetch ? `↻ ${lastFetch.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}
          </span>
        </div>
      </div>

      {/* Next train hero */}
      {!loading && (nextKimball || nextLoop) && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />
          <div style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            NEXT ARRIVALS
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[
              { train: nextKimball, label: 'KMBL', color: '#a0522d' },
              { train: nextLoop, label: 'LOOP', color: 'var(--accent)' },
            ].map(({ train, label, color }) =>
              train ? (
                <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.55rem', letterSpacing: '0.25em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize: train.approaching || train.minutes === 0 ? '2.5rem' : '3.5rem',
                    fontWeight: '900',
                    color: train.delayed ? '#ff3c3c' : train.approaching || train.minutes === 0 ? 'var(--success)' : color,
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                    textShadow: `0 0 20px currentColor`,
                  }}>
                    {train.delayed ? 'DLY' : train.approaching || train.minutes === 0 ? 'DUE' : train.minutes}
                  </div>
                  {!train.delayed && !(train.approaching || train.minutes === 0) && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.2em', marginTop: '4px' }}>MIN</div>
                  )}
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.2em', textAlign: 'center', padding: '2rem' }}>
          FETCHING...
        </div>
      )}

      {/* Error */}
      {data?.error && (
        <div style={{
          background: 'rgba(255,60,60,0.1)',
          border: '1px solid #ff3c3c',
          borderRadius: '12px',
          padding: '1rem',
          color: '#ff3c3c',
          fontSize: '0.7rem',
          letterSpacing: '0.15em',
        }}>
          ERROR: {data.error}
        </div>
      )}

      {/* Direction panels */}
      {!loading && data && !data.error && (
        <>
          <DirectionPanel label="KIMBALL" color="#a0714f" trains={data.kimball} />
          <DirectionPanel label="LOOP" color="var(--accent)" trains={data.loop} />
        </>
      )}

      <div style={{ marginTop: 'auto', color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.15em', textAlign: 'center' }}>
        AUTO-REFRESH 30s // TINYTRON
      </div>
    </main>
  );
}
