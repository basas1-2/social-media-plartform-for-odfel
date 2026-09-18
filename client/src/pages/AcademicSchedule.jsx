import React, { useState, useEffect, useCallback } from 'react';
import { getSchedules, createSchedule, deleteSchedule } from '../services/scheduleService';
import { FaCalendarAlt, FaPlus, FaClock, FaVideo, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';

const AcademicSchedule = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [eventType, setEventType] = useState('deadline');
  const [eventDate, setEventDate] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getSchedules(typeFilter);
      setEvents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this event schedule?')) {
      try {
        await deleteSchedule(id);
        setEvents((prev) => prev.filter((e) => e._id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) {
      setFormError('Title and event date/time are required');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await createSchedule({
        title,
        courseCode,
        eventType,
        eventDate,
        meetingLink,
        description,
      });
      setTitle('');
      setCourseCode('');
      setEventDate('');
      setMeetingLink('');
      setDescription('');
      setShowModal(false);
      fetchSchedules();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to schedule event');
    } finally {
      setSubmitting(false);
    }
  };

  const getEventBadgeClass = (type) => {
    switch (type) {
      case 'virtual_class':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deadline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'study_session':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl shadow-md p-6 text-white mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center">
            <FaCalendarAlt className="mr-3 text-purple-200" />
            ODFEL Academic Schedule & Virtual Classes
          </h1>
          <p className="text-purple-100 text-sm mt-1 max-w-xl">
            Stay organized with upcoming assignment submission deadlines, live virtual tutor sessions, and peer study group meetings.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-purple-900 font-bold px-5 py-2.5 rounded-xl shadow hover:bg-purple-50 transition flex items-center text-sm"
        >
          <FaPlus className="mr-2" /> Add Academic Schedule
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center space-x-2 overflow-x-auto text-xs font-bold">
          {['all', 'deadline', 'virtual_class', 'study_session', 'exam_prep'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3.5 py-1.5 rounded-lg transition capitalize whitespace-nowrap ${
                typeFilter === type
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all'
                ? 'All Events'
                : type === 'deadline'
                ? 'Assignment Deadlines'
                : type === 'virtual_class'
                ? 'Virtual Class Links'
                : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading schedule events...</div>
      ) : (
        <div className="space-y-4">
          {events.map((evt) => (
            <div
              key={evt._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-wrap items-center justify-between gap-4 hover:shadow-md transition"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex flex-col items-center justify-center font-black text-xs flex-shrink-0 border border-purple-100">
                  <span>{new Date(evt.eventDate).getDate()}</span>
                  <span className="text-[10px] font-medium uppercase">
                    {new Date(evt.eventDate).toLocaleString('default', { month: 'short' })}
                  </span>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getEventBadgeClass(evt.eventType)}`}>
                      {evt.eventType.replace('_', ' ')}
                    </span>
                    {evt.courseCode && (
                      <span className="bg-gray-900 text-white font-extrabold text-xs px-2 py-0.5 rounded uppercase">
                        {evt.courseCode}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-gray-900 mt-1">{evt.title}</h3>
                  {evt.description && <p className="text-xs text-gray-600 mt-1 max-w-xl">{evt.description}</p>}

                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <FaClock className="mr-1 text-purple-600" />
                      {new Date(evt.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>·</span>
                    <span>Posted by {evt.creatorId?.fullname}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {evt.meetingLink && (
                  <a
                    href={evt.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs hover:bg-blue-700 transition flex items-center space-x-1.5"
                  >
                    <FaVideo />
                    <span>Join Class</span>
                    <FaExternalLinkAlt size={10} />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(evt._id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  title="Delete event"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-100">
              <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="font-bold text-base text-gray-800">No Scheduled Academic Events</p>
              <p className="text-xs mt-1">Schedule a virtual lecture link or assignment deadline!</p>
            </div>
          )}
        </div>
      )}

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-purple-700" /> Add Academic Schedule Event
            </h2>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Event Title *</label>
                <input
                  type="text"
                  placeholder="e.g. CIT201 Online Live Quiz Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Course Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. CIT201"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-600 uppercase font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-600"
                >
                  <option value="deadline">Assignment Submission Deadline</option>
                  <option value="virtual_class">Live Virtual Lecture (Zoom/Google Meet)</option>
                  <option value="study_session">Peer Study Group Session</option>
                  <option value="exam_prep">Exam Preparation Review</option>
                  <option value="general">General Academic Event</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Virtual Class / Meeting Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Event instructions or agenda..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-600"
                  rows="2"
                />
              </div>

              {formError && <p className="text-red-500 font-bold">{formError}</p>}

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-purple-800 text-white font-bold px-5 py-2 rounded-lg hover:bg-purple-900"
                >
                  {submitting ? 'Adding...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicSchedule;
