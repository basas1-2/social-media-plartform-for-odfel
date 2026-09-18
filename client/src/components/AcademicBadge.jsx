import React from 'react';
import { FaGraduationCap, FaBookReader, FaFlask, FaShieldAlt, FaChalkboardTeacher } from 'react-icons/fa';

const AcademicBadge = ({ role = 'student', showText = true, className = '' }) => {
  const normalized = (role || 'student').toLowerCase();

  switch (normalized) {
    case 'lecturer':
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 ${className}`}
          title="Verified Lecturer / Educator"
        >
          <FaGraduationCap className="mr-1 text-blue-600" />
          {showText && 'Lecturer'}
        </span>
      );
    case 'tutor':
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 ${className}`}
          title="Academic Tutor"
        >
          <FaChalkboardTeacher className="mr-1 text-indigo-600" />
          {showText && 'Tutor'}
        </span>
      );
    case 'researcher':
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 ${className}`}
          title="Academic Researcher"
        >
          <FaFlask className="mr-1 text-purple-600" />
          {showText && 'Researcher'}
        </span>
      );
    case 'admin':
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-800 border border-red-200 ${className}`}
          title="Platform Administrator"
        >
          <FaShieldAlt className="mr-1 text-red-600" />
          {showText && 'Admin'}
        </span>
      );
    case 'student':
    default:
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
          title="Distance Learning Student"
        >
          <FaBookReader className="mr-1 text-emerald-600" />
          {showText && 'Student'}
        </span>
      );
  }
};

export default AcademicBadge;
