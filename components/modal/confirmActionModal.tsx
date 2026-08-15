// components/ConfirmActionModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  actionText: string; // e.g., "Create Post"
  warningText?: string; // Optional warning about gas costs
}

export const ConfirmActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  actionText,
  warningText = "Creating a post costs a gas fee (approx $0.002) and can't be undone. Are you sure you want to continue?",
}: ConfirmActionModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error(`Error confirming ${actionText}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[10001]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0A0A0A]/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform border-[1.5px] border-[#0A0A0A] bg-[#F5F4F0] p-6 text-left align-middle shadow-[8px_8px_0_0_rgba(10,10,10,0.18)] transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-black uppercase leading-tight tracking-tight text-[#0A0A0A] font-[family-name:var(--font-archivo)]"
                >
                  Confirm {actionText}
                </Dialog.Title>
                <div className="mt-2.5">
                  <p className="text-[13px] leading-relaxed text-[#0A0A0A]/60">
                    {warningText}
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="rounded-none border border-[#0A0A0A] bg-transparent px-5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0A0A0A] transition-colors duration-150 hover:bg-[#0A0A0A] hover:text-[#F5F4F0] disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="rounded-none border border-[#0A0A0A] bg-[#0A0A0A] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#F5F4F0] transition-colors duration-150 hover:bg-[#F5F4F0] hover:text-[#0A0A0A] disabled:opacity-40"
                  >
                    {isLoading ? "Confirming…" : "Confirm"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
