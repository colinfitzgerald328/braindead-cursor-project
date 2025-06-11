import { type FormEvent, useState } from 'react';

interface TaskInputFormProps {
  onAddTask: (text: string) => void;
}

export default function TaskInputForm({ onAddTask }: TaskInputFormProps) {
  const [task, setTask] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (task.trim()) {
      onAddTask(task);
      setTask('');
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className={`relative overflow-hidden transition-all duration-200 mb-6 ${
        isFocused
          ? 'shadow-lg ring-1 ring-primary/30 dark:ring-primary-light/30 border-primary/50 dark:border-primary-light/50' 
          : 'shadow-md hover:shadow-lg border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      } rounded-xl bg-white dark:bg-gray-800 border`}
    >
      <div className="flex items-center px-3 py-2">
        {/* Task emoji icon */}
        <div className="flex items-center justify-center h-8 w-8 text-lg">
          <span className="animate-pulse-soft" role="img" aria-label="task">
            ✨
          </span>
        </div>

        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          type="text"
          placeholder="Add a task and hit enter..."
          className="w-full py-2.5 px-2 outline-none border-0 bg-transparent text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-base"
          autoFocus
        />

        <button
          type="submit"
          disabled={!task.trim()}
          aria-label="Add task"
          className={`rounded-lg px-4 py-2 font-medium text-sm transition-all ${
            task.trim()
              ? 'bg-gradient-to-br from-primary to-primary-dark hover:shadow-md hover:from-primary-dark hover:to-primary-dark text-white cursor-pointer'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
          }`}
        >
          Add
        </button>
      </div>

      {/* Subtle hint */}
      <div 
        className={`px-4 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 transition-all ${
          isFocused || task ? 'opacity-100' : 'opacity-0 h-0 py-0 overflow-hidden'
        }`}
      >
        Add details, then press Enter to save
      </div>
    </form>
  );
} 