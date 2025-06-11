import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { type Todo } from '../lib/collabTodo';
import { type FC, type MouseEvent, useEffect, useRef, useState } from 'react';

interface Props {
  todo: Todo;
  onToggle(): void;
  onDelete(): void;
  onReact(emoji: string): void;
  onEdit: (id: string, text: string) => void;
}

const EMOJIS = ['❤️', '👍', '😂', '😮'];

const SortableTodoItem: FC<Props> = ({ todo, onToggle, onDelete, onReact, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: todo.id,
    transition: {
      duration: 150, // Faster transition for more responsive feel
      easing: 'ease' // Simpler easing function
    }
  });

  // Apply styles with optimized transform handling
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition, // No transition while dragging for instant feedback
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative' as const,
    touchAction: 'none', // Prevents browser handling that interferes with drag
    willChange: isDragging ? 'transform' : undefined // Performance optimization for transforms
  };

  const handleReact = (e: MouseEvent, emoji: string) => {
    e.stopPropagation();
    onReact(emoji);
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) {
      return;
    }
    setIsDeleting(true);
    // Add a slight delay for animation
    setTimeout(() => onDelete(), 300);
  };

  // Calculate total reactions
  const totalReactions = Object.values(todo.reactions).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Show confetti on completion
  useEffect(() => {
    if (todo.completed) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [todo.completed]);

  function handleEdit() {
    setIsEditing(true);
  }

  function handleSave() {
    if (editText.trim() !== "") {
      onEdit(todo.id, editText);
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditText(todo.text);
      setIsEditing(false);
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`rounded-lg 
          border-gray-200 dark:border-gray-700 p-4 mb-3 bg-white dark:bg-gray-800
          ${isDragging ? 'shadow-lg z-10 border border-primary/20 bg-primary/5' : 'shadow-sm hover:shadow'}
          ${todo.completed ? 'bg-gray-50 dark:bg-gray-800/70' : ''}
          ${isDeleting ? 'opacity-0 transform translate-x-10' : ''}
          ${!isDragging ? 'transition-all duration-200' : ''}`} // Only apply transitions when not dragging
    >
      <div className="flex items-center justify-between">
        {/* Drag Handle - Better grab area with improved visual feedback */}
        <div 
          {...listeners} 
          className="mr-3 p-1.5 rounded cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-700 
                    flex-shrink-0 touch-none select-none"
          aria-label="Drag handle"
        >
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0-14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8-4a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </div>

        <div className="flex items-center flex-1 min-w-0">
          <button
            onClick={onToggle}
            className={`flex-shrink-0 w-6 h-6 rounded border transition-all
            ${
              todo.completed
                ? 'bg-green-100 border-green-200 dark:bg-green-800/30 dark:border-green-700'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            {todo.completed && (
              <svg
                className="w-5 h-5 m-auto text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>
          <div className="ml-3 min-w-0 flex-1">
            <span
              className={`block text-gray-900 dark:text-gray-100 truncate
              ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}
              ${isDragging ? 'select-none' : ''}`}
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full py-1 px-2 outline-none border-b-2 border-primary focus:border-primary-dark rounded-none transition-colors bg-transparent text-gray-800 dark:text-gray-100"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                />
              ) : todo.text}
            </span>
          </div>
        </div>
        <div className="flex ml-3 items-center">
          {totalReactions > 0 && (
            <div className="mr-3 bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded-full">
              {EMOJIS.map(
                emoji =>
                  todo.reactions[emoji] && (
                    <span key={emoji} className="mr-1">
                      {emoji} {todo.reactions[emoji]}
                    </span>
                  )
              )}
            </div>
          )}
          <div className="relative">
            <button
              onClick={(e) => e.currentTarget.nextElementSibling?.classList.toggle('hidden')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span role="img" aria-label="react" className="text-lg">
                😀
              </span>
            </button>
            <div className="absolute right-0 mt-1 hidden bg-white dark:bg-gray-800 shadow-lg rounded-lg p-1 z-10 border border-gray-200 dark:border-gray-700">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={(e) => handleReact(e, emoji)}
                  className="text-lg px-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleEdit}
            className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="ml-3 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            aria-label="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Confetti animation for completion */}
      {showConfetti && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <div className="animate-confetti-1">✨</div>
          <div className="animate-confetti-2">🎉</div>
          <div className="animate-confetti-3">🎊</div>
          <div className="animate-confetti-4">✨</div>
          <div className="animate-confetti-5">🎉</div>
        </div>
      )}
    </li>
  );
};

export default SortableTodoItem; 