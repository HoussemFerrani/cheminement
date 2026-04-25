"use client";

import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Landmark,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

type PaymentMethodType = "card" | "acss_debit";

interface AddPaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const paymentMethodOptions: {
  id: PaymentMethodType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "card",
    label: "Credit/Debit Card",
    description: "Add a card for instant payments",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: "acss_debit",
    label: "Pre-authorized Debit",
    description: "Link your Canadian bank account",
    icon: <Landmark className="h-5 w-5" />,
  },
];

function SetupForm({
  onSuccess,
  onError,
  paymentMethodType,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  paymentMethodType: PaymentMethodType;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "An error occurred");
      onError?.(error.message || "Failed to add payment method");
      setLoading(false);
    } else if (setupIntent && setupIntent.status === "succeeded") {
      setMessage("Payment method added successfully!");
      setIsComplete(true);

      // Save payment method to backend
      try {
        await apiClient.post("/payments/payment-methods", {
          paymentMethodId: setupIntent.payment_method,
        });
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } catch (err) {
        console.error("Error saving payment method:", err);
        setMessage("Payment method added but failed to save");
        setLoading(false);
      }
    } else if (setupIntent && setupIntent.status === "processing") {
      setMessage("Verification in progress. This may take a moment...");
      setIsComplete(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } else {
      setMessage("Unable to add payment method");
      setLoading(false);
    }
  };

  const getIcon = () => {
    return paymentMethodType === "acss_debit" ? (
      <Landmark className="h-5 w-5 text-primary" />
    ) : (
      <CreditCard className="h-5 w-5 text-primary" />
    );
  };

  const getLabel = () => {
    return paymentMethodType === "acss_debit"
      ? "Pre-authorized Debit"
      : "Credit/Debit Card";
  };

  if (isComplete) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-foreground mb-2">
          {paymentMethodType === "acss_debit"
            ? "Bank Account Linked!"
            : "Payment Method Added!"}
        </h3>
        <p className="text-muted-foreground">
          {paymentMethodType === "acss_debit"
            ? "Your bank account has been linked successfully for pre-authorized debits."
            : "Your payment method has been saved successfully."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
        <div className="flex items-center gap-3 mb-2">
          {getIcon()}
          <span className="text-sm font-medium text-foreground">
            Add {getLabel()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {paymentMethodType === "acss_debit"
            ? "Link your Canadian bank account for pre-authorized debits. No charge will be made now."
            : "This card will be saved for future payments. No charge will be made now."}
        </p>
      </div>

      {paymentMethodType === "acss_debit" && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800 p-4">
          <div className="flex items-start gap-2">
            <Landmark className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Pre-authorized Debit Agreement
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                By adding your bank account, you authorize us to debit your
                account for future payments. You can remove this payment method
                at any time.
              </p>
            </div>
          </div>
        </div>
      )}

      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {message && (
        <div
          className={`rounded-lg border p-4 flex items-start gap-3 ${
            message.includes("success") || message.includes("progress")
              ? "border-green-200 bg-green-50 text-green-800 dark:bg-green-950/20 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-200"
          }`}
        >
          {message.includes("success") || message.includes("progress") ? (
            <CheckCircle2 className="h-5 w-5 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 mt-0.5" />
          )}
          <p className="text-sm">{message}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="w-full"
        size="lg"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading
          ? "Adding..."
          : paymentMethodType === "acss_debit"
            ? "Link Bank Account"
            : "Add Card"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        {paymentMethodType === "acss_debit"
          ? "Your bank account information is securely processed by Stripe."
          : "Secured by Stripe. Your card details are encrypted and never stored on our servers."}
      </p>
    </form>
  );
}

export default function AddPaymentMethodModal({
  open,
  onOpenChange,
  onSuccess,
}: AddPaymentMethodModalProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<PaymentMethodType>("card");
  const [typeSelected, setTypeSelected] = useState(false);

  const createSetupIntent = useCallback(async (type: PaymentMethodType) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post<{
        clientSecret: string;
        setupIntentId: string;
        paymentMethodType: string;
      }>("/payments/setup-intent", { paymentMethodType: type });

      setClientSecret(response.clientSecret);
      setTypeSelected(true);
    } catch (err) {
      console.error("Error creating setup intent:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize payment method form",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setClientSecret("");
      setError(null);
      setLoading(false);
      setSelectedType("card");
      setTypeSelected(false);
    }
  }, [open]);

  const handleContinue = () => {
    createSetupIntent(selectedType);
  };

  const handleBack = () => {
    setTypeSelected(false);
    setClientSecret("");
    setError(null);
  };

  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#0f172a",
      borderRadius: "8px",
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-light">
            Add Payment Method
          </DialogTitle>
          <DialogDescription>
            {typeSelected
              ? "Enter your payment details below"
              : "Choose a payment method type to add"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Payment Method Type Selection */}
          {!typeSelected && !loading && (
            <div className="space-y-6">
              <div className="space-y-3">
                {paymentMethodOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedType(option.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left",
                      selectedType === option.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border/40 bg-card/50 hover:bg-accent/50",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-full p-2.5",
                        selectedType === option.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {option.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                        selectedType === option.id
                          ? "border-primary"
                          : "border-muted-foreground/30",
                      )}
                    >
                      {selectedType === option.id && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              <Button onClick={handleContinue} className="w-full" size="lg">
                Continue
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Preparing form...</p>
            </div>
          )}

          {!loading && error && typeSelected && (
            <div className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleBack} className="w-full">
                Go Back
              </Button>
            </div>
          )}

          {!loading && !error && clientSecret && typeSelected && (
            <div className="space-y-4">
              <button
                onClick={handleBack}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                ← Change payment method type
              </button>
              <Elements
                options={{
                  clientSecret,
                  appearance,
                }}
                stripe={stripePromise}
              >
                <SetupForm
                  onSuccess={handleSuccess}
                  onError={setError}
                  paymentMethodType={selectedType}
                />
              </Elements>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
