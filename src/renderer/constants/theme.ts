export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4',
    icon: '#687076',
    sidebarBg: '#f5f5f5',
    cardBg: '#ffffff',
    border: 'rgba(150,150,150,0.2)',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#4FC3F7',
    icon: '#9BA1A6',
    sidebarBg: '#1a1b1d',
    cardBg: '#1e2022',
    border: 'rgba(150,150,150,0.15)',
  },
} as const;

export const PRIORITY_COLORS = { 3: '#EF4444', 2: '#F59E0B', 1: '#9CA3AF' } as const;
export const PRIORITY_LABELS = { 3: 'High', 2: 'Medium', 1: 'Low' } as const;

export const CATEGORY_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
];
