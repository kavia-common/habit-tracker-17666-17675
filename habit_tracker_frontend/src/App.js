import React, { useState, useEffect } from 'react';
import './App.css';

// Color palette from request
const COLORS = {
  accent: "#ffca28",      // gold
  primary: "#1976d2",     // blue
  secondary: "#424242",   // grey
  bg: "#fff",
  bgLight: "#f8f9fa",
  border: "#e9ecef",
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Utility to get today's date (no time)
function getToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// Utility: returns an array of 7 ISO date strings (Sun ... Sat)
function getCurrentWeekDates() {
  const today = new Date();
  const week = [];
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay()); // Sunday
  for (let i = 0; i < 7; ++i) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    week.push(date.toISOString().slice(0, 10));
  }
  return week;
}

// Habit tracker main app
// PUBLIC_INTERFACE
function App() {
  // Habits: [{ id, title, description, completions: { 'YYYY-MM-DD': true } }]
  const [habits, setHabits] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: '', description: '' });
  const [error, setError] = useState('');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('habits');
    if (saved) setHabits(JSON.parse(saved));
  }, []);

  // Save to localStorage on habits change
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  // PUBLIC_INTERFACE
  function handleAddHabit(e) {
    e.preventDefault();
    if (!newHabit.title.trim()) {
      setError('Title is required');
      return;
    }
    setHabits([
      ...habits,
      {
        id: Date.now(),
        title: newHabit.title.trim(),
        description: newHabit.description.trim(),
        completions: {},
      },
    ]);
    setNewHabit({ title: '', description: '' });
    setError('');
    setShowAdd(false);
  }

  function handleComplete(habitId, dateStr) {
    setHabits(habits =>
      habits.map(h =>
        h.id === habitId
          ? {
              ...h,
              completions: {
                ...h.completions,
                [dateStr]: !h.completions[dateStr],
              },
            }
          : h
      )
    );
  }

  function handleDeleteHabit(id) {
    if (window.confirm("Delete this habit?")) {
      setHabits(habits => habits.filter(h => h.id !== id));
    }
  }

  const weekDates = getCurrentWeekDates();

  return (
    <div style={{
      background: COLORS.bg,
      minHeight: "100vh",
      display: 'flex',
      flexDirection: 'column',
      color: COLORS.secondary,
      fontFamily: 'system-ui,sans-serif',
      transition: 'background 0.2s',
    }}>
      {/* Header */}
      <header style={{
          background: COLORS.primary,
          color: "#fff",
          padding: "1.5rem 0",
          textAlign: "center",
          letterSpacing: "0.02em",
          borderBottom: `2px solid ${COLORS.accent}`,
          fontWeight: 600,
        }}>
        <span style={{
          fontSize: "2rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
        }}>
          🗓️ Habit Tracker
        </span>
      </header>

      {/* Main Section */}
      <main style={{
        maxWidth: 440,
        width: "100%",
        margin: "2rem auto 1rem auto",
        background: COLORS.bgLight,
        borderRadius: 14,
        boxShadow: "0 2px 8px 0 rgba(50,50,80,0.08)",
        padding: "2rem 1.5rem 1.2rem 1.5rem",
        border: `1px solid ${COLORS.border}`,
        minHeight: 360,
      }}>
        {/* Habits List */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:'center',marginBottom:14}}>
            <h2 style={{fontWeight: 500, margin: 0, fontSize: "1.2rem", letterSpacing:0.01}}>My Habits</h2>
            <button
              aria-label="Add habit"
              onClick={()=>{setShowAdd(true)}}
              style={{
                background: COLORS.accent,
                color: COLORS.secondary,
                border: 0,
                borderRadius: 6,
                fontWeight: 700,
                padding: "6px 14px",
                fontSize: "1rem",
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(200,200,0,0.04)'
              }}
            >+ Add</button>
          </div>
          {habits.length === 0 && (
            <div style={{
              fontSize: "1rem", color: COLORS.secondary, opacity: 0.85,
              padding: "1rem 0", textAlign: "center"
            }}>
              Nothing being tracked yet.<br />Click <span style={{color:COLORS.accent,fontWeight:600}}>+ Add</span> to add a habit.
            </div>
          )}
          {habits.map((habit) => (
            <div key={habit.id} style={{
              background: "#fff",
              margin: "18px 0",
              borderRadius: 9,
              boxShadow: '0 1px 6px 0 rgba(60,60,120,0.045)',
              padding: "1.1rem 1.1rem 1rem 1.1rem",
              border: `1px solid ${COLORS.border}`,
              position: "relative"
            }}>
              <div style={{
                fontWeight:600,
                color:COLORS.primary,
                fontSize:"1.07rem"
              }}>
                {habit.title}
                <button
                  aria-label="Delete habit"
                  title="Delete"
                  style={{
                    position: "absolute",
                    right: 14,
                    top: 13,
                    background: "none",
                    color: COLORS.secondary,
                    fontSize: 17,
                    border: 0,
                    padding: 2,
                    opacity: 0.7,
                    cursor: "pointer"
                  }}
                  onClick={()=>handleDeleteHabit(habit.id)}
                >✕</button>
              </div>
              <div style={{
                color: COLORS.secondary,
                fontSize: ".92rem",
                margin: "4px 0 11px 0",
                minHeight: 14,
                opacity: habit.description ? 0.95 : 0.6,
              }}>
                {habit.description || <span style={{opacity:0.6}}>(No description)</span>}
              </div>
              {/* Progress Row */}
              <div style={{display:"flex",gap:"6px 0",alignItems:"center"}}>
                {weekDates.map((date, i) => (
                  <button
                    key={date}
                    aria-label={`Mark ${DAYS[i]} as complete`}
                    style={{
                      flex:1,
                      border:0,
                      background: habit.completions[date] ? COLORS.primary : COLORS.border,
                      color: habit.completions[date] ? "#fff" : COLORS.secondary,
                      borderRadius: 6,
                      marginRight: i === 6 ? 0 : 5,
                      padding: "6px 0",
                      cursor: "pointer",
                      fontWeight: habit.completions[date] ? 600 : 400,
                      opacity: i === (new Date().getDay()) ? 1 : 0.83,
                      outline: (date === getToday()) ? `2px solid ${COLORS.accent}` : "none",
                      boxShadow: habit.completions[date]
                        ? "0 2px 5px 0 rgba(25,118,210,0.12)"
                        : "none",
                      fontSize: ".97rem",
                      transition: "background 0.14s"
                    }}
                    onClick={()=>handleComplete(habit.id, date)}
                  >
                    {habit.completions[date] ? "✓" : DAYS[i][0]}
                  </button>
                ))}
              </div>
              {/* Weekly summary */}
              <div style={{
                fontSize: ".82rem",
                marginTop: 7,
                color: COLORS.secondary,
                opacity: .6
              }}>
                {(() => {
                  const completed = weekDates.filter(dt => habit.completions[dt]).length;
                  return `This week: ${completed}/7 days`;
                })()}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add Habit Modal */}
      {showAdd && (
        <div style={{
          position:"fixed",top:0,left:0,right:0,bottom:0,
          background:'rgba(0,0,0,0.16)',zIndex:30,display:"flex",alignItems:"center",justifyContent:"center"
        }}>
          <form
            aria-label="Add habit"
            onSubmit={handleAddHabit}
            style={{
              minWidth:280,
              background:"#fff",
              borderRadius:10,
              boxShadow:"0 6px 24px 0 rgba(60,60,80,0.12)",
              padding:"2rem 1.3rem 1.6rem 1.3rem",
              display:"flex",
              flexDirection:'column',
              gap: '1rem',
              border: `1.3px solid ${COLORS.primary}`,
            }}>
            <h2 style={{
              margin:0,
              color:COLORS.primary,
              fontWeight:700,
              fontSize:"1.3rem",
              letterSpacing:".03em",
            }}>
              Add Habit
            </h2>
            <div>
              <label style={{
                display:"block",marginBottom:".16rem",fontWeight:500,
                fontSize:".99rem",color:COLORS.secondary,opacity:.84}}>Title</label>
              <input
                required
                type="text"
                maxLength={64}
                autoFocus
                value={newHabit.title}
                style={{
                  width:"100%",
                  padding:".56rem",
                  fontSize:"1rem",
                  borderRadius:6,
                  border:`1.3px solid ${COLORS.primary}`,
                  outline:"none",
                  marginBottom:.16,
                }}
                onChange={e=>
                  setNewHabit(h=>({...h, title: e.target.value }))
                }
                placeholder="e.g. Drink water"
              />
            </div>
            <div>
              <label style={{
                display:"block",marginBottom:".16rem",fontWeight:500,
                fontSize:".99rem",color:COLORS.secondary,opacity:.75}}>Description</label>
              <textarea
                maxLength={128}
                rows={2}
                value={newHabit.description}
                style={{
                  width:"100%",
                  padding:".45rem",
                  fontSize:".97rem",
                  borderRadius:6,
                  border:`1.14px solid ${COLORS.border}`,
                  outline:"none"
                }}
                placeholder="(Optional) – Add a short description"
                onChange={e=>
                  setNewHabit(h=>({...h, description: e.target.value }))
                }
              />
            </div>
            {error && (
              <div style={{
                  color:"#c0392b",fontSize:".96rem",marginTop:-8
              }}>{error}</div>
            )}
            <div style={{display:"flex",justifyContent:"flex-end",gap:12,marginTop:10}}>
              <button
                type="button"
                style={{
                  background: COLORS.border,
                  color: COLORS.secondary,
                  border: 0,
                  borderRadius: 6,
                  fontWeight: 500,
                  fontSize: ".99rem",
                  padding: "5px 15px",
                  cursor: "pointer"
                }}
                onClick={()=>{setShowAdd(false); setError(''); setNewHabit({title:'', description:''})}}
              >Cancel</button>
              <button
                type="submit"
                style={{
                  background: COLORS.primary,
                  color: "#fff",
                  border: 0,
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: "1.01rem",
                  padding: "6px 16px",
                  cursor: "pointer",
                  letterSpacing: ".01em",
                  boxShadow: '0 2px 6px 0 rgba(25,118,210,0.10)'
                }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Footer - Weekly overview */}
      <footer style={{
          background: COLORS.bgLight,
          borderTop: `1.5px solid ${COLORS.border}`,
          width:"100%",
          textAlign:"center",
          padding: "1.2rem 0 .9rem 0",
          marginTop:'auto'
        }}>
        <div style={{fontWeight:500,marginBottom:5,color:COLORS.secondary,opacity:.88}}>
          Week Overview
        </div>
        {/* Mini overall progress bar */}
        <div style={{display:'flex',justifyContent:'center',gap:5,marginBottom:6}}>
          {weekDates.map((date, idx) => {
            // For all habits, count those completed that day
            const completed = habits.filter(h=>h.completions[date]).length;
            const total = habits.length;
            const percent = total ? completed / total : 0;
            // Progress dot
            return (
              <div key={date} title={DAYS[idx]}
                style={{
                  width: 22, height: 18, background: COLORS.border,
                  borderRadius: 10, display:"flex",alignItems:'center',justifyContent:'center',
                }}>
                <div style={{
                  width:"11px",
                  height:"11px",
                  borderRadius:"50%",
                  background: percent >= 1 ? COLORS.primary
                              : percent > 0.4 ? COLORS.accent
                              : COLORS.border,
                  border: `2.2px solid ${COLORS.secondary}`,
                  transition:"background 0.2s",
                  opacity: (date === getToday()) ? 1 : 0.83,
                }}></div>
              </div>
            );
          })}
        </div>
        <div style={{
          color: COLORS.secondary,
          fontSize: ".92rem",
          opacity: 0.73
        }}>
          {habits.length === 0
            ? "Add a habit to get started."
            : (() => {
                // Sum completions this week for all habits
                const totalDays = weekDates.length * habits.length;
                const completions = habits.reduce(
                  (sum, h) =>
                    sum + weekDates.filter(d=>h.completions[d]).length, 0);
                return `${completions} of ${totalDays} completions this week`;
              })()
          }
        </div>
      </footer>
    </div>
  );
}

export default App;
