import { TouchableOpacity, Text } from 'react-native';

export default function Button({ title, onPress, color = '#10b981' }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: color,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginVertical: 10,
      }}
    >
      <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}