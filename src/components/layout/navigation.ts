import { Flame, History, Home, ThermometerSun, Waves } from 'lucide-react';
import type { ViewId } from '../../types';

export const NAV_ITEMS: Array<{
  id: ViewId;
  label: string;
  shortLabel: string;
  shortcut: string;
  icon: typeof Home;
}> = [
  { id: 'dashboard', label: 'Panel', shortLabel: 'Panel', shortcut: '1', icon: Home },
  { id: 'conduction', label: 'Conducción', shortLabel: 'Cond.', shortcut: '2', icon: Flame },
  { id: 'convection', label: 'Convección', shortLabel: 'Conv.', shortcut: '3', icon: Waves },
  { id: 'radiation', label: 'Radiación', shortLabel: 'Rad.', shortcut: '4', icon: ThermometerSun },
  { id: 'history', label: 'Historial', shortLabel: 'Hist.', shortcut: '5', icon: History },
];
