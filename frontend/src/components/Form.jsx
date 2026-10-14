export default function Form({
  title,
  children,
  onSubmit,
  submitLabel = "Enviar",
  onCancel,
<<<<<<< HEAD
  cancelLabel = "Cancelar"
=======
  cancelLabel = "Cancelar",
  disabled = false
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
}) {
  return <form
    onSubmit={onSubmit}
  >
    {title && <h3>{title}</h3>}
    {children}
<<<<<<< HEAD
    {onCancel && <input
      type="button"
      value={cancelLabel}
      onClick={onCancel}
    />}
    <input
      type="submit"
      value={submitLabel}
    />
=======

    <div
      className="form-buttons"
    >
      {onCancel && <input
        type="button"
        value={cancelLabel}
        onClick={onCancel}
        disabled={disabled}
      />}
      <input
        type="submit"
        value={submitLabel}
        disabled={disabled}
      />
    </div>
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
  </form>;
}