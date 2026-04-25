"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactFormDialog({
  open,
  onOpenChange,
}: ContactFormDialogProps) {
  const t = useTranslations("Contact.form");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      message: "",
    });
    setSubmitStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitStatus("success");
      resetForm();
      setTimeout(() => onOpenChange(false), 1500);
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {t("badge")}
          </DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dialog-firstName" className="text-sm font-light">
                Prénom | first name <span className="text-primary">*</span>
              </Label>
              <Input
                id="dialog-firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Votre prénom"
                className="h-11 font-light"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-lastName" className="text-sm font-light">
                Nom | last name <span className="text-primary">*</span>
              </Label>
              <Input
                id="dialog-lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Votre nom"
                className="h-11 font-light"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dialog-phone" className="text-sm font-light">
              Téléphone <span className="text-primary">*</span>
            </Label>
            <Input
              id="dialog-phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="(514) 123-4567"
              className="h-11 font-light"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dialog-email" className="text-sm font-light">
              Courriel <span className="text-primary">*</span>
            </Label>
            <Input
              id="dialog-email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@courriel.com"
              className="h-11 font-light"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dialog-message" className="text-sm font-light">
              Message <span className="text-primary">*</span>
            </Label>
            <Textarea
              id="dialog-message"
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              placeholder="Votre message..."
              className="min-h-[140px] w-full resize-y font-light"
            />
          </div>
          {submitStatus === "success" && (
            <p className="text-sm text-green-600 dark:text-green-400">
              {t("successMessage")}
            </p>
          )}
          {submitStatus === "error" && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {t("errorMessage")}
            </p>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("submitting")}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {t("submit")}
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
