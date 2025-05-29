import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  house: 'home',
  'paperplane.fill': 'send',
  paperplane: 'send',
  'chart.bar.fill': 'bar-chart',
  'chart.bar': 'insert-chart',
  'list.bullet': 'format-list-bulleted',
  'plus.circle.fill': 'add-circle',
  'plus.circle': 'add-circle-outline',
  'map.fill': 'map',
  map: 'map',
} as Partial<Record<string, React.ComponentProps<typeof MaterialIcons>['name']>>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      style={style}
      name={MAPPING[name]}
    />
  );
}