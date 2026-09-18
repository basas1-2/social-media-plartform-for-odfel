import React, { useState, useEffect, useCallback } from 'react';
import { getResources, uploadResource, incrementDownload, toggleUpvoteResource } from '../services/resourceService';
import { FaBook, FaSearch, FaFileDownload, FaThumbsUp, FaFileAlt, FaFileUpload } from 'react-icons/fa';
import AcademicBadge from '../components/AcademicBadge';

const ResourceHub = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [courseCodeFilter, setCourseCodeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Lecture Note');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getResources(categoryFilter, courseCodeFilter, search);
      setResources(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, courseCodeFilter, search]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleDownload = async (id, filePath) => {
    try {
      await incrementDownload(id);
      window.open(filePath, '_blank');
      setResources((prev) =>
        prev.map((r) => (r._id === id ? { ...r, downloadsCount: r.downloadsCount + 1 } : r))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpvote = async (id) => {
    try {
      const { data } = await toggleUpvoteResource(id);
      setResources((prev) =>
        prev.map((r) => (r._id === id ? { ...r, upvotesCount: data.count } : r))
      );
      fetchResources();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !courseCode.trim()) {
      setFormError('Title and course code are required');
      return;
    }
    if (!file) {
      setFormError('Please choose a document file to upload');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await uploadResource({
        title,
        courseCode,
        subject,
        category,
        description,
        file,
      });
      setTitle('');
      setCourseCode('');
      setSubject('');
      setDescription('');
      setFile(null);
      setShowModal(false);
      fetchResources();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to upload resource');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl shadow-md p-6 text-white mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center">
            <FaBook className="mr-3 text-emerald-200" />
            Digital Educational Resource Library
          </h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            Access lecture notes, past question papers, assignment guides, and research PDFs uploaded by distance learning tutors and students.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-emerald-800 font-bold px-5 py-2.5 rounded-xl shadow hover:bg-emerald-50 transition flex items-center text-sm"
        >
          <FaFileUpload className="mr-2" /> Upload Material
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 space-y-3">
        <div className="flex items-center space-x-2 overflow-x-auto text-xs font-bold">
          {['all', 'Lecture Note', 'Past Question', 'Syllabus', 'Assignment Guide', 'Textbook/Ebook'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg transition capitalize whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All Materials' : cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search resource title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <input
            type="text"
            placeholder="Course Code (e.g. CIT201)"
            value={courseCodeFilter}
            onChange={(e) => setCourseCodeFilter(e.target.value.toUpperCase())}
            className="w-36 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold uppercase text-emerald-800 placeholder-gray-400 outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Resources Table / Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading educational resources...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((res) => (
            <div
              key={res._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-50 text-emerald-700 font-extrabold text-xs px-2.5 py-0.5 rounded border border-emerald-200 uppercase">
                      {res.category}
                    </span>
                    <span className="bg-gray-900 text-white font-extrabold text-xs px-2.5 py-0.5 rounded uppercase">
                      {res.courseCode}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUpvote(res._id)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-gray-50 hover:bg-gray-100 text-xs text-gray-600 font-semibold border"
                  >
                    <FaThumbsUp className="text-blue-500" />
                    <span>{res.upvotes?.length || 0}</span>
                  </button>
                </div>

                <h3 className="font-extrabold text-base text-gray-900 mt-2.5">{res.title}</h3>
                {res.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{res.description}</p>
                )}

                <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                  <span className="truncate">Uploaded by {res.uploaderId?.fullname}</span>
                  <AcademicBadge role={res.uploaderId?.role} showText={false} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">
                  {(res.fileSize / 1024).toFixed(0)} KB · {res.downloadsCount || 0} downloads
                </span>

                <button
                  onClick={() => handleDownload(res._id, res.filePath)}
                  className="bg-emerald-700 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-emerald-800 shadow-xs transition flex items-center space-x-1.5"
                >
                  <FaFileDownload />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          ))}

          {resources.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-100">
              <FaFileAlt className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="font-bold text-base text-gray-800">No Educational Resources Found</p>
              <p className="text-xs mt-1">Upload lecture notes or past papers to assist your peers!</p>
            </div>
          )}
        </div>
      )}

      {/* Upload Resource Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FaFileUpload className="mr-2 text-emerald-700" /> Upload Study Material
            </h2>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Document Title *</label>
                <input
                  type="text"
                  placeholder="e.g. CIT201 Lecture 1-4 Complete Summary Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Course Code *</label>
                <input
                  type="text"
                  placeholder="e.g. CIT201"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-600 uppercase font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-600"
                >
                  <option value="Lecture Note">Lecture Note</option>
                  <option value="Past Question">Past Question</option>
                  <option value="Syllabus">Syllabus</option>
                  <option value="Assignment Guide">Assignment Guide</option>
                  <option value="Textbook/Ebook">Textbook/Ebook</option>
                  <option value="Other">Other Document</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Select File (PDF, Word, PPT, TXT, ZIP) *</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.rtf,.zip,.rar"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Provide details about topics covered in this document..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-600"
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
                  className="bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg hover:bg-emerald-800"
                >
                  {submitting ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceHub;
