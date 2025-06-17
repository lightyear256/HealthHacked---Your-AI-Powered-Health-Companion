import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            🏥 HealthHacked
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Tailwind CSS is working! 🎉
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;