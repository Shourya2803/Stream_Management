'use client';

import Navbar from '@/components/adminNavbar';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const branches = ['CSE', 'ECE', 'CIVIL', 'MECHANICAL'];

export default function StreamsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [error, setError] = useState('');

  const handleView = async (branch: string) => {
    setLoading(true);
    setSelectedBranch(branch);
    setError('');
    try {
      const res = await fetch('/api/students/by-branch', {
        method: 'POST',
        body: JSON.stringify({ branch }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format');
      }

      const responseText = await res.text();
      if (!responseText) {
        throw new Error('Empty response received');
      }

      const data = JSON.parse(responseText);
      setStudents(data.students || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
      const error = err as Error;
      if (error instanceof SyntaxError) {
        setError('Invalid response from server. Please try again.');
      } else if (error.message?.includes('Server error')) {
        setError('Server error occurred. Please check if the API is running.');
      } else if (error.message?.includes('Failed to fetch')) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (students.length === 0) return;

    const dataToExport = students.map((s: any) => ({
      Name: s.name,
      Email: s.email || '',
      Phone: s.phone || '',
      Branch: selectedBranch,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, `${selectedBranch}-students.xlsx`);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Academic Streams
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              View students by their academic branch
            </p>
          </div>

          {/* Branch Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {branches.map((branch) => (
              <div
                key={branch}
                className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {branch}
                    </h2>
                  </div>
                  <button
                    onClick={() => handleView(branch)}
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 disabled:cursor-not-allowed transition-all duration-300 font-medium text-sm sm:text-base shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                  >
                    {loading && selectedBranch === branch ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        View Students
                        <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Export Button */}
          {students.length > 0 && (
            <button
              onClick={handleExport}
              className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Export to Excel
            </button>
          )}

          {/* Results Section */}
          {selectedBranch && students.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 bg-linear-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedBranch} Students
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {students.length} student{students.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-linear-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {students.map((student: any, index: number) => (
                      <tr key={student.id || index} className="hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 group">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{student.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{student.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
