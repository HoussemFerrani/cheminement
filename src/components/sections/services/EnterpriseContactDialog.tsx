"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import EnterpriseContactForm from "./EnterpriseContactForm";

interface EnterpriseContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EnterpriseContactDialog({
  open,
  onOpenChange,
}: EnterpriseContactDialogProps) {
  const t = useTranslations("Services.enterpriseCta");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {t("formTitle")}
          </DialogTitle>
        </DialogHeader>
        <EnterpriseContactForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
