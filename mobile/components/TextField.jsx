import Field from './Field';
import { TextInput } from 'react-native';
import styles from '../styles';

export default function TextField({
  label,
  value,
  onChangeText,
  editable = true,
  ...props
}) {
  return (
    <Field label={label}>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        placeholderTextColor="#71717a"
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        {...props}
      />
    </Field>
  );
}