import CollabTodoList from './components/CollabTodoList';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-8 pb-20">
      <CollabTodoList />
      
      {/* Footer */}
      <footer className="absolute bottom-0 inset-x-0 bg-white/80 dark:bg-black/20 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="max-w-3xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Built with <span className="text-red-500">♥</span> using React, TypeScript, Yjs, and DnD Kit
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App
