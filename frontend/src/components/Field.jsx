export default function Field({
  label,
  children,
  required = false
}) {
  return (
    <div className="field">
      <label>
        {required && <span style={{ color: '#e11d48', marginRight: '4px' }} title="Este dato es obligatorio">*</span>}
        {label}
      </label>
      {children}
    </div>
  );
}