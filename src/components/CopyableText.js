import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Share } from 'react-native';

export default function CopyableText({ text, style, children }) {
  const handleCopy = () => {
    // Convert children to string properly
    let textToCopy = text;

    if (!textToCopy && children !== undefined && children !== null) {
      // Handle different types of children
      if (typeof children === 'string' || typeof children === 'number') {
        textToCopy = String(children);
      } else if (Array.isArray(children)) {
        textToCopy = children.join(' ');
      } else if (typeof children === 'object' && children.props?.children) {
        textToCopy = String(children.props.children);
      } else {
        textToCopy = 'Text copied';
      }
    }

    // Only share if we have valid text
    if (textToCopy && String(textToCopy).trim()) {
      Share.share({
        message: String(textToCopy),
      }).catch((error) => {
        // Fallback: just show alert
        console.log('Share error:', error);
        Alert.alert('Copied', String(textToCopy));
      });
    }
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
