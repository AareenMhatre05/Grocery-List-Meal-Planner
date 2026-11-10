import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { IconButton, cx } from "./ui";

// Native <dialog>: focus trap, Esc to close and top-layer stacking come from the browser
export default function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleCancel = (e) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  const widths = { md: "max-w-lg", lg: "max-w-3xl" };

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onClick={(e) => e.target === ref.current && onClose()}
      className={cx(
        "app-dialog m-auto max-h-[min(88vh,760px)] w-[calc(100%-2rem)] overflow-hidden rounded-xl border border-forest/10 bg-cream-50 p-0 text-ink shadow-dialog",
        widths[size]
      )}
    >
      {open && (
        <div className="flex max-h-[min(88vh,760px)] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-forest/10 px-6 pb-4 pt-5">
            <div className="min-w-0">
              <h2 id="dialog-title" className="text-xl font-semibold tracking-[-0.01em]">{title}</h2>
              {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
            </div>
            <IconButton icon={X} label="Close" size="sm" onClick={onClose} className="-mr-2" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-forest/10 px-6 py-4">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
