import React from "react";

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto bg-[rgba(24,49,45,0.24)] px-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="glass-panel relative mx-auto w-full max-w-xl rounded-[28px] border border-white/60 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--line-soft)] pb-4">
          <h3 className="text-2xl text-[var(--text-main)]">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-white/70 p-2 text-[var(--text-muted)] hover:bg-white hover:text-[var(--text-main)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
