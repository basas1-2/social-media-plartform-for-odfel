import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { searchUsers } from '../services/userService';
import UserCard from '../components/UserCard';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setSearching(true);
        try {
          const { data } = await searchUsers(query);
          setResults(data);
        } catch (error) {
          console.error(error);
        } finally {
          setSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-semibold mb-4">Search Users</h1>
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, username, or email..."
            className="w-full border rounded-lg pl-10 pr-4 py-2 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-4">
        {searching && <p className="text-center text-gray-500">Searching...</p>}
        {!searching && results.length === 0 && query && (
          <p className="text-center text-gray-500">No users found</p>
        )}
        {results.map((user) => (
          <UserCard key={user._id} user={user} />
        ))}
        {!query && (
          <p className="text-center text-gray-500 mt-8">Start typing to search for users</p>
        )}
      </div>
    </div>
  );
};

export default Search;
