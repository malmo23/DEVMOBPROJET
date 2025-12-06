import { Text, View } from 'react-native';

export default function Header({ title }) {
  return (
    <View style={{
      backgroundColor: '#10b981',
      paddingVertical: 15,
      paddingHorizontal: 20,
      alignItems: 'center',
    }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
        {title}
      </Text>
    </View>
  );
}
