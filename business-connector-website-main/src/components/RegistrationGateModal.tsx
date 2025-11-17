import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import LeadContactForm from "@/components/LeadContactForm";

export default function RegistrationGateModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed w-[95vw] max-w-lg bg-white rounded-xl shadow-xl focus:outline-none left-1/2 -translate-x-1/2 top-4 md:top-1/2 md:-translate-y-1/2 max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
            <Dialog.Title className="font-semibold">Create your free account</Dialog.Title>
            <Dialog.Close className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>
          <div className="p-4 overflow-y-auto">
            <Dialog.Description className="text-sm text-gray-600 mb-3">You've viewed a few homes. Register to unlock full access to photos, details, and market insights. It takes less than a minute.</Dialog.Description>
            <LeadContactForm onSuccess={() => { localStorage.setItem('cfh_registered', 'true'); onOpenChange(false); }} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
