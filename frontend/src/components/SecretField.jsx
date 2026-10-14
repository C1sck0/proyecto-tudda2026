import Field from './Field';

export default function SecretField({
  label,
  value,
  onChange,
  required = false,
  disabled = false
}) {
  return (
    <Field label={label} required={required}>
      <input
        type="password"
        value={value}
        onInput={(e) => onChange?.(e.target.value)}
        required={required}
        disabled={disabled}
      />
    </Field>
  );
}