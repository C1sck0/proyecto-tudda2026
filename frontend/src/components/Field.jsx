export default function Field({
  label,
  children,
  required = false
}) {
<<<<<<< HEAD
  return <div>
=======
  return <div
    className="field"
  >
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
    <label>
      {required && <span style={{ color: 'red' }} title="Este dato es obligatorio">*</span>}
      {label}
    </label>
    {children}
  </div>;
}