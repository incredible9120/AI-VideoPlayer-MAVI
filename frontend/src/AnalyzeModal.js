import React from "react";
import "./AnalyzeModal.css";

function AnalyzeModal({ children, onClose }) {
  return (
    <div /*className="top-modal"*/ onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="content-wrap">{children}</div>
        <button className="modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default AnalyzeModal;
