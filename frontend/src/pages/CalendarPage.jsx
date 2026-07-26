import React, { useState, useEffect, useContext } from 'react';
import apiCall from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Video, FileText, AlertCircle, Clock, PlusSquare, Trash2 } from 'lucide-react';

const CalendarPage = () => {
  const { user } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Holiday creation state
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayTitle, setHolidayTitle] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayDesc, setHolidayDesc] = useState('');

  // Fetch calendar events
  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    const [liveRes, assignRes] = await Promise.all([
      apiCall('/livesessions'),
      apiCall('/assignments')
    ]);

    const compiledEvents = [];

    // Process Live Sessions
    if (liveRes.success && liveRes.data && liveRes.data.length > 0) {
      liveRes.data.forEach(session => {
        compiledEvents.push({
          id: session._id,
          title: session.title,
          date: new Date(session.date),
          type: 'live',
          duration: session.duration,
          meetingLink: session.meetingLink || 'https://meet.jit.si/edulearn',
          description: `Virtual live lecture with video streaming. Duration: ${session.duration} minutes.`
        });
      });
    }

    // Process Assignments
    if (assignRes.success && assignRes.data && assignRes.data.length > 0) {
      assignRes.data.forEach(assign => {
        compiledEvents.push({
          id: assign._id,
          title: `Deadline: ${assign.title}`,
          date: new Date(assign.deadline),
          type: 'assignment',
          description: assign.description,
          maxMarks: assign.maxMarks
        });
      });
    }

    // Load Holidays from LocalStorage
    const savedHolidays = localStorage.getItem('platform_holidays');
    if (savedHolidays) {
      const parsedHolidays = JSON.parse(savedHolidays);
      parsedHolidays.forEach(h => {
        compiledEvents.push({
          id: h.id,
          title: `Holiday: ${h.title}`,
          date: new Date(h.date),
          type: 'holiday',
          description: h.description || 'Public academic holiday - no classes or deadlines.'
        });
      });
    } else {
      // Default initial holidays seeder
      const defaultHolidays = [
        { id: 'h_1', title: 'National Academic Holiday', date: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(), description: 'National campus academic holiday.' }
      ];
      localStorage.setItem('platform_holidays', JSON.stringify(defaultHolidays));
      defaultHolidays.forEach(h => {
        compiledEvents.push({
          id: h.id,
          title: `Holiday: ${h.title}`,
          date: new Date(h.date),
          type: 'holiday',
          description: h.description
        });
      });
    }

    setEvents(compiledEvents);
    setLoading(false);
  };

  const handleCreateHoliday = (e) => {
    e.preventDefault();
    if (!holidayTitle || !holidayDate) return;

    const saved = localStorage.getItem('platform_holidays');
    const holidaysList = saved ? JSON.parse(saved) : [];

    const newHoliday = {
      id: `holiday_${Date.now()}`,
      title: holidayTitle,
      date: new Date(holidayDate).toISOString(),
      description: holidayDesc
    };

    holidaysList.push(newHoliday);
    localStorage.setItem('platform_holidays', JSON.stringify(holidaysList));

    setHolidayTitle('');
    setHolidayDate('');
    setHolidayDesc('');
    setShowHolidayModal(false);
    fetchEvents();
  };

  const handleDeleteHoliday = (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    const saved = localStorage.getItem('platform_holidays');
    if (saved) {
      const parsed = JSON.parse(saved);
      const filtered = parsed.filter(h => h.id !== id);
      localStorage.setItem('platform_holidays', JSON.stringify(filtered));
      setSelectedEvent(null);
      fetchEvents();
    }
  };

  // Helper calendar calculations
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const calendarCells = [];
  
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  }

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}><CalendarIcon size={32} color="#6366f1" /> Academic Calendar</h1>
          <p style={{ color: '#9ca3af', margin: '0.25rem 0 0 0' }}>Track class hours, assignment submissions, and national holidays.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user?.role === 'admin' && (
            <button onClick={() => setShowHolidayModal(true)} className="btn btn-primary" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <PlusSquare size={16} /> Add Holiday
            </button>
          )}

          {/* Date controllers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={20} /></button>
            <span style={{ fontWeight: 600, color: 'white', fontSize: '1rem', minWidth: '130px', textAlign: 'center' }}>{monthName} {year}</span>
            <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex' }}><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {loading && <Loader />}

      {/* Calendar Grid Board */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        {/* Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', minHeight: '380px' }}>
          {calendarCells.map((date, idx) => {
            const dateEvents = getEventsForDate(date);
            const isToday = date && 
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();
            
            const isSelected = date && selectedDate && date.toDateString() === selectedDate.toDateString();

            return (
              <div 
                key={idx}
                onClick={() => date && setSelectedDate(date)}
                style={{
                  background: date ? (isToday ? 'rgba(99, 102, 241, 0.08)' : (isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.01)')) : 'transparent',
                  border: date ? (isToday ? '1px solid rgba(99, 102, 241, 0.4)' : (isSelected ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.03)')) : 'none',
                  borderRadius: '12px',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  position: 'relative',
                  minHeight: '80px',
                  alignItems: 'stretch',
                  cursor: date ? 'pointer' : 'default'
                }}
              >
                {date && (
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: isToday || isSelected ? 700 : 500, 
                    color: isToday || isSelected ? '#818cf8' : '#9ca3af',
                    alignSelf: 'flex-start',
                    marginBottom: '0.25rem'
                  }}>
                    {date.getDate()}
                  </span>
                )}

                {/* Event tags inside grid cell */}
                {dateEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                    className="calendar-event-tag"
                    style={{
                      background: event.type === 'live' ? 'rgba(245, 158, 11, 0.1)' : event.type === 'holiday' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: event.type === 'live' ? '1px solid rgba(245, 158, 11, 0.2)' : event.type === 'holiday' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                      color: event.type === 'live' ? '#fbbf24' : event.type === 'holiday' ? '#34d399' : '#ef4444',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'left'
                    }}
                    title={event.title}
                  >
                    <span className="event-emoji-title">{event.type === 'live' ? '🎥' : event.type === 'holiday' ? '🌴' : '📝'} {event.title}</span>
                    <span className="event-dot" style={{ display: 'none' }}>●</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="glass-card fade-in" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'white', margin: 0 }}>
              Agenda for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <button 
              onClick={() => setSelectedDate(null)} 
              className="btn btn-secondary" 
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
            >
              Close Agenda
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {getEventsForDate(selectedDate).length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                No academic sessions, assignments, or holidays scheduled for this date.
              </p>
            ) : (
              getEventsForDate(selectedDate).map(event => (
                <div 
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: `4px solid ${event.type === 'live' ? '#f59e0b' : event.type === 'holiday' ? '#10b981' : '#ef4444'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                  className="hover-scale"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <h4 style={{ fontSize: '0.95rem', color: 'white', margin: 0 }}>{event.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>{event.description}</p>
                  </div>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    color: event.type === 'live' ? '#fbbf24' : event.type === 'holiday' ? '#34d399' : '#f87171', 
                    textTransform: 'uppercase',
                    background: event.type === 'live' ? 'rgba(245, 158, 11, 0.1)' : event.type === 'holiday' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px'
                  }}>
                    {event.type === 'live' ? 'Live Session' : event.type === 'holiday' ? 'Holiday' : 'Assignment'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Holiday Modal */}
      <Modal isOpen={showHolidayModal} onClose={() => setShowHolidayModal(false)} title="Add Academic Holiday">
        <form onSubmit={handleCreateHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Holiday Title</label>
            <input 
              type="text" 
              value={holidayTitle} 
              onChange={(e) => setHolidayTitle(e.target.value)} 
              className="glass-input" 
              placeholder="e.g. Winter Break / Thanksgiving"
              required 
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              value={holidayDate} 
              onChange={(e) => setHolidayDate(e.target.value)} 
              className="glass-input" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea 
              rows="2"
              value={holidayDesc} 
              onChange={(e) => setHolidayDesc(e.target.value)} 
              className="glass-input" 
              placeholder="Guidelines for students during holiday..."
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Save Holiday Event</button>
        </form>
      </Modal>

      {/* Event Details Overlay Modal */}
      {selectedEvent && (
        <Modal
          isOpen={true}
          title={selectedEvent.type === 'live' ? '🎥 Live Virtual Class' : selectedEvent.type === 'holiday' ? '🌴 Academic Holiday' : '📝 Assignment Deadline'}
          onClose={() => setSelectedEvent(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '0.25rem' }}>{selectedEvent.title}</h3>
              <span className={`badge ${selectedEvent.type === 'live' ? 'badge-warning' : selectedEvent.type === 'holiday' ? 'badge-success' : 'badge-danger'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                {selectedEvent.type === 'live' ? 'Live Session' : selectedEvent.type === 'holiday' ? 'Holiday Event' : 'Assignment Task'}
              </span>
            </div>

            <p style={{ color: '#e5e7eb', fontSize: '0.9rem', lineHeight: '1.6' }}>{selectedEvent.description}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                <Clock size={16} />
                <span>Date: {selectedEvent.date.toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <button onClick={() => setSelectedEvent(null)} className="btn btn-secondary" style={{ flex: 1 }}>Close</button>
              
              {selectedEvent.type === 'live' && (
                <a 
                  href={selectedEvent.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary" 
                  style={{ flex: 2, display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Video size={16} /> Join Broadcast Room
                </a>
              )}

              {user?.role === 'admin' && selectedEvent.type === 'holiday' && (
                <button 
                  onClick={() => handleDeleteHoliday(selectedEvent.id)} 
                  className="btn btn-secondary" 
                  style={{ flex: 1, display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: 'center', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default CalendarPage;
