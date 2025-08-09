import { useState } from 'react';

interface DialogOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmOptions extends DialogOptions {
  type: 'confirm';
}

export const useDialog = () => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
    confirmText: string;
    cancelText: string;
    showCancel: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    onConfirm: undefined
  });

  const showDialog = (options: DialogOptions) => {
    setDialogState({
      isOpen: true,
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      showCancel: false,
      onConfirm: undefined
    });
  };

  const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title: options.title,
        message: options.message,
        type: 'confirm',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        showCancel: true,
        onConfirm: () => resolve(true)
      });
    });
  };

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    dialogState,
    showDialog,
    showConfirm,
    closeDialog
  };
};