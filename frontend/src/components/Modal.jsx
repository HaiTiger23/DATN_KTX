import { Modal as AntModal } from 'antd';

/**
 * Thin wrapper so screens share one modal config (width, mask, destroy).
 * Parent `onSave` should reject/throw on validation errors so the modal stays open.
 */
export default function Modal({ open, title, children, onClose, onSave, cancelLabel = 'Cancel', saveLabel = 'Save' }) {
  return (
    <AntModal
      title={title}
      open={open}
      onCancel={onClose}
      okText={saveLabel}
      cancelText={cancelLabel}
      onOk={onSave}
      destroyOnClose
      width={560}
      maskClosable={false}
    >
      {children}
    </AntModal>
  );
}
