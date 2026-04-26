import { TouchableOpacity, Text, Animated } from 'react-native';
import { useRef } from 'react';
import { colors, radius, typography } from '../theme';

export default function Button({ title, onPress, color, variant = 'solid', style, textStyle, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50 }).start();
  };
  const onPressOut = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const bg = color || colors.primary;

  return (
    <Animated.View style={{ transform: [{ scale }], marginVertical: 6, opacity: disabled ? 0.6 : 1 }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.9}
        disabled={disabled}
        style={[
          {
            backgroundColor: bg,
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderRadius: radius.lg,
            alignItems: 'center',
            shadowColor: bg,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 6,
          },
          style,
        ]}
      >
        <Text style={[{ color: colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 }, textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
