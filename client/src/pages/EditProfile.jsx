import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userService';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: user?.fullname || '',
    username: user?.username || '',
    bio: user?.bio || '',
    role: user?.role || 'student',
    institution: user?.institution || 'ODFEL Open University',
    faculty: user?.faculty || '',
    department: user?.department || '',
    courseOfStudy: user?.courseOfStudy || '',
    academicLevel: user?.academicLevel || '100 Level',
    matricNumber: user?.matricNumber || '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = {
        ...formData,
        profilePicture,
        coverPhoto,
      };
      const { data: updated } = await updateProfile(data);
      updateUser(updated);
      navigate(`/profile/${updated.username}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile & Academic Credentials</h1>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-xs font-semibold">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Academic Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:border-primary font-medium"
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer / Educator</option>
                  <option value="tutor">Academic Tutor</option>
                  <option value="researcher">Researcher</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Academic Level / Status</label>
                <select
                  name="academicLevel"
                  value={formData.academicLevel}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:border-primary font-medium"
                >
                  <option value="100 Level">100 Level</option>
                  <option value="200 Level">200 Level</option>
                  <option value="300 Level">300 Level</option>
                  <option value="400 Level">400 Level</option>
                  <option value="Postgraduate">Postgraduate (MSc/PhD)</option>
                  <option value="Faculty Staff">Faculty Staff</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:border-primary"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Course of Study</label>
                <input
                  type="text"
                  name="courseOfStudy"
                  value={formData.courseOfStudy}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:border-primary"
                  placeholder="e.g. Software Engineering"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Institution</label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Academic Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                className="w-full border rounded-lg px-4 py-2 outline-none focus:border-primary"
                placeholder="Describe your academic interests, research, or study goals..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePicture(e.target.files[0])}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Cover Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverPhoto(e.target.files[0])}
                  className="w-full text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-dark transition disabled:opacity-50 mt-4"
            >
              {loading ? 'Saving...' : 'Save Academic Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
