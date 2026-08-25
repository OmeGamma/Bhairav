import React from 'react';
import { Member2Routes } from './routes/Member2Routes';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-[#0b0c10] flex flex-col">
      {/* Basic mock shell since Member 1 shell isn't here */}
      <header className="h-16 bg-[#12141a] border-b border-gray-800 flex items-center justify-between px-6">
        <div className="font-bold text-xl tracking-widest">BHAIRAV</div>
        <nav className="flex gap-4 text-sm text-gray-400">
          <Link to="/verification" className="hover:text-white transition-colors">Verification</Link>
          <Link to="/network" className="hover:text-white transition-colors">Network</Link>
          <Link to="/personnel" className="hover:text-white transition-colors">Personnel</Link>
          <Link to="/reports" className="hover:text-white transition-colors">Reports</Link>
          <Link to="/ask-bhairav" className="text-blue-400 hover:text-blue-300 transition-colors">Ask Bhairav</Link>
        </nav>
      </header>
      
      <main className="flex-1 overflow-hidden relative">
        <Member2Routes />
      </main>

      <footer className="h-8 bg-[#0b0c10] flex items-center justify-center">
        <span className="text-[10px] text-gray-600 opacity-60">Bhairav: Shadows and Steel - By OmeGamma</span>
      </footer>
    </div>
  );
}

export default App;
