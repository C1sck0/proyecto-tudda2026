import { Pressable, Text } from 'react-native';
import styles from '../styles';

export default function Button({
  label,
  onPress,
  children
}) {
  return <Pressable
    style={styles.button}
    label="Button"
    onPress={onPress}
  >
    {label && <Text>{label}</Text> || null}
    {children}
  </Pressable>;
}