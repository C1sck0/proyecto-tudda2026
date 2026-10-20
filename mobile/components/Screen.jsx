import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import styles from '../styles';

export default function Screen({
  children,
  title,
}) {
  return (
    <SafeAreaView style={styles.screen}>
      <View>
        {title && <Text>{title}</Text>}
        {children}
      </View>
    </SafeAreaView>
  );
}