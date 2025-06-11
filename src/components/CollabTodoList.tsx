import { useCallback, useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { nanoid } from 'nanoid';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, MeasuringStrategy } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import SortableTodoItem from './SortableTodoItem';
import Header from './Header';
import EmptyState from './EmptyState';
import TaskInputForm from './TaskInputForm';

// Define the structure of a todo item
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  reactions: { [key: string]: number };
}

// Room name for real-time collaboration
const ROOM_NAME = 'collaborative-todo-app-v1';

export default function CollabTodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [yTodos, setYTodos] = useState<Y.Array<any> | null>(null);
  const [peerCount, setPeerCount] = useState<number>(1); // Including self
  const [peerEmojis, setPeerEmojis] = useState<string[]>(['🧑‍💻']);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);

  // Initialize sensors for drag and drop with optimized settings
  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { 
        distance: 3, // Reduce activation distance for faster response
        delay: 0,    // No delay for immediate pickup
        tolerance: 0 // No tolerance for immediate feedback
      } 
    }),
    useSensor(KeyboardSensor, { 
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Initialize Yjs document and WebRTC provider for real-time collaboration
  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(ROOM_NAME, ydoc, { 
      signaling: ['wss://signaling.yjs.dev']
    });
    
    const yTodosArray = ydoc.getArray('todos');

    setYTodos(yTodosArray);

    // Listen for changes to the shared todos array
    yTodosArray.observe(() => {
      setTodos(yTodosArray.toArray() as Todo[]);
    });

    // Initial state if empty
    if (yTodosArray.length === 0) {
      yTodosArray.push([
        { id: nanoid(), text: 'Share this list with colleagues', completed: false, reactions: {} },
        { id: nanoid(), text: 'Drag tasks to reorder them', completed: false, reactions: {} },
      ]);
    }

    // Update peer count when connections change
    provider.awareness.on('change', () => {
      // Count peers (including self)
      const count = provider.awareness.getStates().size;
      setPeerCount(count);

      // Collect emoji from each peer's client state
      const emojis = Array.from(provider.awareness.getStates().values())
        .map(state => state.emoji || '🧑‍💻')
        .slice(0, 8); // Limit to avoid overcrowding
      setPeerEmojis(emojis);
    });

    // Set current peer's emoji
    const randomEmojis = ['🧑‍💻', '👩‍💻', '👨‍💻', '🧙', '👩‍🚀', '👨‍🚀', '🦸‍♀️', '🦸‍♂️'];
    const myEmoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
    provider.awareness.setLocalState({ emoji: myEmoji });

    // Add user's emoji to the list
    setPeerEmojis([myEmoji]);

    // Mark syncing as complete after a short delay
    setTimeout(() => setIsSyncing(false), 800);

    // Clean up
    return () => {
      provider.disconnect();
      ydoc.destroy();
    };
  }, []);

  // Add a new todo
  const addTodo = useCallback(
    (text: string) => {
      if (yTodos) {
        yTodos.push([
          {
            id: nanoid(),
            text,
            completed: false,
            reactions: {},
          },
        ]);
      }
    },
    [yTodos]
  );

  // Toggle todo completion status
  const toggleTodo = useCallback(
    (id: string) => {
      if (!yTodos) return;

      const index = todos.findIndex(todo => todo.id === id);
      if (index !== -1) {
        const todo = todos[index];
        const updatedTodo = { ...todo, completed: !todo.completed };
        yTodos.delete(index);
        yTodos.insert(index, [updatedTodo]);
      }
    },
    [todos, yTodos]
  );

  // Delete a todo
  const deleteTodo = useCallback(
    (id: string) => {
      if (!yTodos) return;

      const index = todos.findIndex(todo => todo.id === id);
      if (index !== -1) {
        yTodos.delete(index);
      }
    },
    [todos, yTodos]
  );

  // Edit a todo text
  const editTodo = useCallback(
    (id: string, newText: string) => {
      if (!yTodos) return;

      const index = todos.findIndex(todo => todo.id === id);
      if (index !== -1) {
        const todo = todos[index];
        const updatedTodo = { ...todo, text: newText };
        yTodos.delete(index);
        yTodos.insert(index, [updatedTodo]);
      }
    },
    [todos, yTodos]
  );

  // Add a reaction to a todo
  const addReaction = useCallback(
    (id: string, emoji: string) => {
      if (!yTodos) return;

      const index = todos.findIndex(todo => todo.id === id);
      if (index !== -1) {
        const todo = todos[index];
        const updatedReactions = { ...todo.reactions };
        updatedReactions[emoji] = (updatedReactions[emoji] || 0) + 1;
        const updatedTodo = { ...todo, reactions: updatedReactions };
        yTodos.delete(index);
        yTodos.insert(index, [updatedTodo]);
      }
    },
    [todos, yTodos]
  );

  // Track active item during drag
  const handleDragStart = () => {
    // No action needed
  };
  
  // Handle drag end for reordering todos
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id || !yTodos) return;

    const oldIndex = todos.findIndex(todo => todo.id === active.id);
    const newIndex = todos.findIndex(todo => todo.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      // Create a new array with the new order
      const newTodos = arrayMove(todos, oldIndex, newIndex);
      
      // Update yTodos to match the new order in a batch operation for better performance
      yTodos.doc?.transact(() => {
        yTodos.delete(0, yTodos.length);
        yTodos.insert(0, newTodos);
      });
    }
  };
  
  // Handle drag cancel
  const handleDragCancel = () => {
    // No need to reset activeId since it's not used
  };

  // Calculate completed todos
  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <Header peerCount={peerCount} peerEmojis={peerEmojis} />

      <TaskInputForm onAddTask={addTodo} />

      {isSyncing ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary-light border-t-primary animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Syncing tasks...</p>
        </div>
      ) : todos.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Progress bar */}
          <div className="mb-5 relative">
            <div className="flex items-center justify-between mb-1.5 text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Task progress</span>
              <span className="text-gray-500 dark:text-gray-400">{percentComplete}% complete</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              ></div>
            </div>
          </div>

          {/* Todo list with drag and drop support */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            modifiers={[restrictToVerticalAxis]}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always
              }
            }}
          >
            <SortableContext 
              items={todos.map(todo => todo.id)} 
              strategy={verticalListSortingStrategy}
            >
              <ul className="todo-list space-y-3">
                {todos.map(todo => (
                  <SortableTodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={() => toggleTodo(todo.id)}
                    onDelete={() => deleteTodo(todo.id)}
                    onReact={(emoji) => addReaction(todo.id, emoji)}
                    onEdit={editTodo}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
} 