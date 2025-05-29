import { useColorScheme } from '@/hooks/useColorScheme';

const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
    border: '#E5E7EB',
    card: '#FFFFFF',
    primary: '#0a7ea4',
    secondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    surface: '#F9FAFB',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
    border: '#374151',
    card: '#1F2937',
    primary: '#3B82F6',
    secondary: '#9CA3AF',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    surface: '#111827',
  },
};

export type ColorName = keyof typeof Colors.light;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName
): string {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export { Colors };