import { Pressable, Text } from 'react-native';
import styles from '../styles';

export default function Button({
  label,
  children
}) {
  return <Pressable
    style={styles.button}
    label="Button"
  >
    {label && <Text>{label}</Text> || null}
    {children}
  </Pressable>;
}