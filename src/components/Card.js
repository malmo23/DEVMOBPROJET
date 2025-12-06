import { View } from 'react-native';

export default function Card({ children }) {
  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 24,
      padding: 24,
      margin: 20,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    }}>
      {children}
    </View>
  );
}