import Field from './Field';

export default function TextField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = ''
}) {
  return (
    <Field label={label} required={required}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        required={required}
        onInput={(e) => onChange?.(e.target.value)}
        disabled={disabled}
      />
    </Field>
  );
}