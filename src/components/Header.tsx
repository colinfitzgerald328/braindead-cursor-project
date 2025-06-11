import { useMemo } from 'react';

interface HeaderProps {
  peerCount: number;
  peerEmojis: string[];
}

export default function Header({ peerCount, peerEmojis }: HeaderProps) {
  // Get current time for greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <header className="mb-8 pt-2">
      {/* App Logo */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-70 group-hover:opacity-80 transition duration-1000"></div>
          <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full shadow-inner text-white text-xl font-bold">
            <div className="relative flex z-10">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center animate-ping opacity-30">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* App Title */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          Collab Tasks
        </h1>

        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
          {greeting}, collaborate in real-time
        </p>

        <div 
          className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 
                     border border-green-500/30 text-green-700 dark:text-green-300 text-xs font-medium"
        >
          <span className="animate-pulse mr-1.5 w-1.5 h-1.5 rounded-full bg-green-500"></span>
          <span>{peerCount} {peerCount === 1 ? 'person' : 'people'} connected</span>
        </div>
        
        <div className="mt-3 flex justify-center gap-1">
          {peerEmojis.map((e, i) => (
            <div 
              key={i} 
              className="text-xl animate-float relative" 
              style={{ 
                animationDelay: `${i * 0.3}s`,
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))' 
              }}
            >
              {e}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
} 