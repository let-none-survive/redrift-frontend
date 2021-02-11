import React from 'react'
import classNames from 'classnames'

const Modal = ({ onClose, isOpen, children, onSave, isLoading = false, isDelete, isMove }) => {
  return (
    <div className={classNames('modal', { 'is-active': isOpen })}>
      <div className="modal-background" />
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Modal title</p>
          <button onClick={onClose} className="delete" aria-label="close" />
        </header>
        <section className="modal-card-body">
          {children}
        </section>
        <footer className="modal-card-foot">
          <button onClick={onSave} className={classNames('button is-success', { 'is-loading': isLoading, 'is-danger': isDelete })}>
            {isDelete ? 'Delete' : 'Save changes'}
          </button>
          <button onClick={onClose} className="button">Cancel</button>
        </footer>
      </div>
    </div>
  )
}

export default Modal
