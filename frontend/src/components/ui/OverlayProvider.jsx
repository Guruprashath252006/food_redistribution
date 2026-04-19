import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from './Button';
import { cn } from '../../lib/cn';
import { OverlayContext } from './overlayContext';

function ToastItem({ toast, onClose }) {
  const tone =
    toast.variant === 'danger'
      ? 'border-rose-200/70 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/40'
      : toast.variant === 'success'
        ? 'border-emerald-200/70 dark:border-emerald-900/60 bg-emerald-50/90 dark:bg-emerald-950/35'
        : 'border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/70';

  return (
    <div className={cn('glass rounded-2xl border p-4 shadow-xl backdrop-blur-xl', tone)}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {toast.title && (
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
              {toast.title}
            </p>
          )}
          {toast.description && (
            <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-300 leading-snug">
              {toast.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 dark:text-slate-400"
          aria-label="Close toast"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function Modal({ state, resolve, close }) {
  const inputRef = useRef(null);
  const [value, setValue] = useState(state?.defaultValue ?? '');
  const [formValues, setFormValues] = useState(() => {
    if (state?.type !== 'form') return {};
    return (state?.fields || []).reduce((acc, field) => {
      acc[field.id] = field.defaultValue ?? '';
      return acc;
    }, {});
  });

  useEffect(() => {
    if (state?.type === 'prompt') {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [state?.type]);

  const onCancel = () => {
    resolve(state.type === 'confirm' ? false : null);
    close();
  };

  const onConfirm = () => {
    if (state.type === 'confirm') {
      resolve(true);
    } else if (state.type === 'form') {
      resolve(formValues);
    } else {
      resolve(value);
    }
    close();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={state?.title || 'Dialog'}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/80 shadow-2xl backdrop-blur-xl">
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {state?.title || 'Confirm'}
              </h3>
              {state?.description && (
                <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {state.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 dark:text-slate-400"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          {state?.type === 'prompt' && (
            <div className="mt-5">
              {state?.inputLabel && (
                <label className="block text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                  {state.inputLabel}
                </label>
              )}
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={state?.placeholder || ''}
                className="w-full rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
              />
            </div>
          )}

          {state?.type === 'form' && (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(state?.fields || []).map((field, index) => {
                const commonClassName =
                  'w-full rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25';

                return (
                  <div
                    key={field.id}
                    className={cn(field.fullWidth ? 'sm:col-span-2' : '')}
                  >
                    {field.label && (
                      <label className="mb-2 block text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                        {field.label}
                      </label>
                    )}

                    {field.type === 'select' ? (
                      <select
                        autoFocus={index === 0}
                        value={formValues[field.id] ?? ''}
                        onChange={(e) =>
                          setFormValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                        }
                        className={commonClassName}
                      >
                        {(field.options || []).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        autoFocus={index === 0}
                        rows={field.rows || 3}
                        value={formValues[field.id] ?? ''}
                        onChange={(e) =>
                          setFormValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                        }
                        placeholder={field.placeholder || ''}
                        className={cn(commonClassName, 'resize-none')}
                      />
                    ) : (
                      <input
                        autoFocus={index === 0}
                        type={field.type || 'text'}
                        value={formValues[field.id] ?? ''}
                        onChange={(e) =>
                          setFormValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                        }
                        placeholder={field.placeholder || ''}
                        className={commonClassName}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button variant="secondary" onClick={onCancel}>
              {state?.cancelText || 'Cancel'}
            </Button>
            <Button variant={state?.confirmVariant || 'primary'} onClick={onConfirm}>
              {state?.confirmText || 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OverlayProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [modalState, setModalState] = useState(null);
  const modalResolveRef = useRef(null);
  const toastTimers = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = toastTimers.current.get(id);
    if (timer) clearTimeout(timer);
    toastTimers.current.delete(id);
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'default', durationMs = 3000 }) => {
      const id = `t_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const next = { id, title, description, variant };
      setToasts((prev) => [next, ...prev].slice(0, 4));
      const timer = setTimeout(() => removeToast(id), durationMs);
      toastTimers.current.set(id, timer);
      return id;
    },
    [removeToast],
  );

  const closeModal = useCallback(() => {
    setModalState(null);
    modalResolveRef.current = null;
  }, []);

  const confirm = useCallback(({ title, description, confirmText, cancelText, confirmVariant } = {}) => {
    return new Promise((resolve) => {
      modalResolveRef.current = resolve;
      setModalState({
        type: 'confirm',
        title: title || 'Confirm action',
        description,
        confirmText,
        cancelText,
        confirmVariant,
      });
    });
  }, []);

  const prompt = useCallback(
    ({ title, description, inputLabel, placeholder, defaultValue, confirmText, cancelText, confirmVariant } = {}) => {
      return new Promise((resolve) => {
        modalResolveRef.current = resolve;
        setModalState({
          type: 'prompt',
          title: title || 'Enter value',
          description,
          inputLabel,
          placeholder,
          defaultValue,
          confirmText,
          cancelText,
          confirmVariant,
        });
      });
    },
    [],
  );

  const form = useCallback(
    ({ title, description, fields, confirmText, cancelText, confirmVariant } = {}) => {
      return new Promise((resolve) => {
        modalResolveRef.current = resolve;
        setModalState({
          type: 'form',
          title: title || 'Enter details',
          description,
          fields: Array.isArray(fields) ? fields : [],
          confirmText,
          cancelText,
          confirmVariant,
        });
      });
    },
    [],
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!modalState) return;
      if (e.key === 'Escape') {
        const resolve = modalResolveRef.current;
        if (resolve) resolve(modalState.type === 'confirm' ? false : null);
        closeModal();
      }
      if (e.key === 'Enter' && (modalState.type === 'confirm')) {
        const resolve = modalResolveRef.current;
        if (resolve) resolve(true);
        closeModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalState, closeModal]);

  const value = useMemo(() => ({ toast, confirm, prompt, form }), [toast, confirm, prompt, form]);

  return (
    <OverlayContext.Provider value={value}>
      {children}

      {createPortal(
        <div className="fixed top-4 right-4 z-[110] w-[360px] max-w-[calc(100vw-2rem)] space-y-3">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
          ))}
        </div>,
        document.body,
      )}

      {modalState &&
        createPortal(
          <Modal
            state={modalState}
            resolve={(val) => modalResolveRef.current?.(val)}
            close={closeModal}
          />,
          document.body,
        )}
    </OverlayContext.Provider>
  );
}
