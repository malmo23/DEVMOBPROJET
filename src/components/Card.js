import { View } from 'react-native';
import { colors, radius, shadows } from '../theme';

export default function Card({ children, style }) {
  return (
    <View style={[
      {
        backgroundColor: colors.gradientCard,
        borderRadius: radius.xl,
        padding: 24,
        margin: 16,
        ...shadows.card,
      },
      style,
    ]}>
      {children}
    </View>
  );
}
