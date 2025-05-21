// src/components/Modal.jsx
import React, { useEffect, useRef } from "react";
import "./Modal.css";

function Modal({ onClose, onSave, value, setValue }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.code === "Enter") {
      onSave();
    } else if (e.code === "Escape") {
      onClose();
    }
  };

  return (
    <div /*className="top-modal"*/>
      <div className="modal-content">
        <h4>Enter Topic</h4>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Scene Introduction"
        />
        <button onClick={onSave}>Save</button>
      </div>
    </div>
  );
}

export default Modal;
