import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    institution: 'ODFEL Open University',
    faculty: '',
    department: '',
    courseOfStudy: '',
    academicLevel: '100 Level',
    matricNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(formData);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex items-center justify-center">
      <div className="max-w-lg w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-primary tracking-wide">CODFEL Network</h1>
          <p className="text-gray-600 text-sm mt-1">Open, Distance & Flexible Learning Social Platform</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Create Academic Account</h2>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-xs font-semibold">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary"
                  placeholder="e.g. Dr. Jane Doe"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary"
                  placeholder="e.g. janedoe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary"
                placeholder="e.g. jane@student.odfel.edu"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Academic Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary font-medium"
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer / Educator</option>
                  <option value="tutor">Academic Tutor</option>
                  <option value="researcher">Researcher</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Academic Level</label>
                <select
                  name="academicLevel"
                  value={formData.academicLevel}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary font-medium"
                >
                  <option value="100 Level">100 Level</option>
                  <option value="200 Level">200 Level</option>
                  <option value="300 Level">300 Level</option>
                  <option value="400 Level">400 Level</option>
                  <option value="Postgraduate">Postgraduate (MSc / PhD)</option>
                  <option value="Staff/Educator">Faculty Staff</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary"
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
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary"
                  placeholder="e.g. Software Engineering"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary"
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary"
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-dark shadow-sm transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Register Academic Account'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-600 mt-5">
            Already registered?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
