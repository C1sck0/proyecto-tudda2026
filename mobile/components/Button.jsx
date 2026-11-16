import { Pressable, Text } from 'react-native';
import styles from '../styles';

export default function Button({
  label,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'danger'
  disabled = false,
  children,
}) {
  const btnStyle =
    variant === 'danger'
      ? styles.buttonDanger
      : variant === 'secondary'
        ? styles.buttonSecondary
        : styles.button;

  const txtStyle =
    variant === 'danger'
      ? styles.buttonDangerText
      : variant === 'secondary'
        ? styles.buttonSecondaryText
        : styles.buttonText;

  return (
    <Pressable
      style={({ pressed }) => [
        btnStyle,
        (pressed || disabled) && { opacity: 0.7 },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {label ? <Text style={txtStyle}>{label}</Text> : null}
      {children}
    </Pressable>
  );
}