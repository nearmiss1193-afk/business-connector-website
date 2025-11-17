import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import LeadContactForm from "@/components/LeadContactForm";

export default function RegistrationGateModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-lg bg-white rounded-xl shadow-xl focus:outline-none">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="font-semibold">Create your free account</div>
            <Dialog.Close className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-3">You've viewed a few homes. Register to unlock full access to photos, details, and market insights. It takes less than a minute.</p>
            <LeadContactForm onSuccess={() => { localStorage.setItem('cfh_registered', 'true'); onOpenChange(false); }} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
