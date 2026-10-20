import Field from './Field';
import { TextInput } from 'react-native';
import styles from '../styles';

export default function TextField({
  label,
  ...props
}) {
  return <Field
    label={label}
  >
    <TextInput {...props} style={styles.textField} />
  </Field>;
}