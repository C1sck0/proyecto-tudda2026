import Field from './Field';

export default function TextField({
  label,
  value,
  onChange,
<<<<<<< HEAD
  required = false
=======
  required = false,
  disabled = false
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
}) {
  return <Field
    label={label}
    required={required}
  >
    <input
      type="text"
      value={value}
      required={required}
      onInput={(e) => onChange?.(e.target.value)}
<<<<<<< HEAD
=======
      disabled={disabled}
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
    />
  </Field>;
}