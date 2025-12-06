import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Share } from 'react-native';

export default function CopyableText({ text, style, children }) {
  const handleCopy = () => {
    Share.share({
      message: text || children,
    }).catch(() => {
      // Fallback: just show alert
      Alert.alert('Copied', `Text copied: ${text || children}`);
    });
  };

  return (
    <TouchableOpacity onLongPress={handleCopy} onPress={handleCopy}>
      <Text 
        selectable={true}
        style={[style, styles.copyableText]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  copyableText: {
    userSelect: 'text',
  },
});
