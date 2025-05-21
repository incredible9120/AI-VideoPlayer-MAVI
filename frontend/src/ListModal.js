import React, { useEffect, useRef } from "react";
import "./Modal.css";

export default function ListModal({ children, onClose }) {
  return (
    <div /*className="top-modal"*/ onClick={onClose}>
      <div className="modal-content">{children}</div>
    </div>
  );
}
