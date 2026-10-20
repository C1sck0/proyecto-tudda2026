
import { View, Text } from 'react-native';
import styles from '../styles';

export default function Field({
  label,
  children
}) {
  return <View style={styles.field}>
    {label && <Text>{label}</Text> || null}
    {children}
  </View>;
}
