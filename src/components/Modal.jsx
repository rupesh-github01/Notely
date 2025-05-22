function Modal({ title, onClose, onSubmit, defaultValue }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h3>{title}</h3>
        <input
          type="text"
          defaultValue={defaultValue}
          id="modal-input"
          autoFocus
        />
        <div className="modal-buttons">
          <button onClick={() => onSubmit(document.getElementById("modal-input").value)}>Save</button>
          <button onClick={onClose} className="danger">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
