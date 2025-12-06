import { View, Text } from 'react-native';

export default function Header({ title, subtitle }) {
  return (
    <View style={{ alignItems: 'center', marginTop: 60, marginBottom: 40 }}>
      <Text style={{ fontSize: 36, fontWeight: '900', color: '#134e4a' }}>
        {title}
      </Text>
      {subtitle && <Text style={{ fontSize: 18, color: '#0d9488', marginTop: 8 }}>
        {subtitle}
      </Text>}
    </View>
  );
}