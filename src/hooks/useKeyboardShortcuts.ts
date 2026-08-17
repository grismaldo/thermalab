import { useEffect } from 'react';
import type { ViewId } from '../types';

const VIEW_BY_DIGIT: Record<string, ViewId> = {
  '1': 'dashboard',
  '2': 'conduction',
  '3': 'convection',
  '4': 'radiation',
  '5': 'history',
};

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
};

export function useKeyboardShortcuts({
  onNavigate,
  onToggleHelp,
  onCloseHelp,
}: {
  onNavigate: (view: ViewId) => void;
  onToggleHelp: () => void;
  onCloseHelp: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.key === 'Escape') {
        onCloseHelp();
        return;
      }
      if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault();
        onToggleHelp();
        return;
      }
      const view = VIEW_BY_DIGIT[event.key];
      if (view) onNavigate(view);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCloseHelp, onNavigate, onToggleHelp]);
}
