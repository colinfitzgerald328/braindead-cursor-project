import { useEffect, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { nanoid } from 'nanoid';

/**
 * A Yjs doc shared via WebRTC. Anyone who loads the site will automatically
 * join the same room and start syncing todos with peers — no backend needed.
 */
const doc = new Y.Doc();
const roomName = 'braindead-cursor-collab-todos';

// Use public signalling servers bundled with y-webrtc
const provider = new WebrtcProvider(roomName, doc, {
  // Explicit list keeps bundle small and avoids downloading default list
  signaling: [
    'wss://signaling.yjs.dev',
    'wss://y-webrtc-signaling-eu.herokuapp.com',
    'wss://y-webrtc-signaling-us.herokuapp.com',
  ],
});

// Shared array of todo maps
const yTodos = doc.getArray<Y.Map<any>>('todos');

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  reactions: Record<string, number>;
}

// -------- helper functions --------
function yMapToTodo(map: Y.Map<any>): Todo {
  return {
    id: map.get('id'),
    text: map.get('text'),
    completed: map.get('completed'),
    reactions: Object.fromEntries((map.get('reactions') as Y.Map<any> | undefined)?.entries() ?? []),
  };
}

// -------- React utilities --------
export function useTodos() {
  const [, forceUpdate] = useState(0);

  // Re-render when the Yjs array (or any nested map) changes
  useEffect(() => {
    const rerender = () => forceUpdate((c) => c + 1);
    yTodos.observeDeep(rerender);
    return () => yTodos.unobserveDeep(rerender);
  }, []);

  const todos = yTodos.toArray().map(yMapToTodo);

  // CRUD actions
  const addTodo = useCallback((text: string) => {
    doc.transact(() => {
      const map = new Y.Map();
      map.set('id', nanoid());
      map.set('text', text);
      map.set('completed', false);
      yTodos.push([map]);
    });
  }, []);

  const toggleTodo = useCallback((id: string) => {
    const item = yTodos.toArray().find((m) => m.get('id') === id);
    if (item) item.set('completed', !item.get('completed'));
  }, []);

  const removeTodo = useCallback((id: string) => {
    const idx = yTodos.toArray().findIndex((m) => m.get('id') === id);
    if (idx !== -1) yTodos.delete(idx, 1);
  }, []);

  const reorderTodo = useCallback((from: number, to: number) => {
    if (from === to) return;
    
    doc.transact(() => {
      const item = yTodos.get(from);
      if (!item) return;
      
      // Create a clone of the item to safely transfer
      const clone = new Y.Map();
      clone.set('id', item.get('id'));
      clone.set('text', item.get('text'));
      clone.set('completed', item.get('completed'));
      
      // Preserve reactions if any
      const reactions = item.get('reactions');
      if (reactions) {
        const newReactions = new Y.Map();
        reactions.forEach((value: number, key: string) => {
          newReactions.set(key, value);
        });
        clone.set('reactions', newReactions);
      }
      
      // Delete first, then calculate adjusted target position
      yTodos.delete(from, 1);
      
      // If moving down, adjust index to account for the deletion
      const adjusted = from < to ? to - 1 : to;
      
      // Insert at the new position
      yTodos.insert(adjusted, [clone]);
    });
  }, []);

  const addReaction = useCallback((id: string, emoji: string) => {
    const item = yTodos.toArray().find((m) => m.get('id') === id);
    if (!item) return;
    
    doc.transact(() => {
      let reactions = item.get('reactions') as Y.Map<number> | undefined;
      if (!reactions) {
        reactions = new Y.Map();
        item.set('reactions', reactions);
      }
      const count = reactions.get(emoji) ?? 0;
      reactions.set(emoji, count + 1);
    });
  }, []);

  return { todos, addTodo, toggleTodo, removeTodo, reorderTodo, addReaction, provider };
} 