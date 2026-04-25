"use client";

import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Shield,
} from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface GuestPaymentFormProps {
  guestEmail: string;
  guestName: string;
  onSuccess: (paymentMethodId: string) => void;
  onBack: () => void;
  loading?: boolean;
}

interface SetupFormProps {
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

function SetupForm({
  onSuccess,
  onError,
  loading: externalLoading,
}: SetupFormProps) {
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
      onError(error.message || "Failed to verify payment method");
      setLoading(false);
    } else if (setupIntent && setupIntent.status === "succeeded") {
      setMessage("Payment method verified!");
      setIsComplete(true);

      // Pass the payment method ID back to the parent
      if (setupIntent.payment_method) {
        const paymentMethodId =
          typeof setupIntent.payment_method === "string"
            ? setupIntent.payment_method
            : setupIntent.payment_method.id;
        setTimeout(() => {
          onSuccess(paymentMethodId);
        }, 1000);
      }
    } else {
      setMessage("Unable to verify payment method");
      setLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-foreground mb-2">
          Payment Method Verified!
        </h3>
        <p className="text-muted-foreground">
          Proceeding to book your appointment...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {message && !message.includes("verified") && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || !elements || loading || externalLoading}
        className="w-full"
        size="lg"
      >
        {(loading || externalLoading) && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {loading ? "Verifying..." : "Verify & Continue"}
      </Button>
    </form>
  );
}

export default function GuestPaymentForm({
  guestEmail,
  guestName,
  onSuccess,
  onBack,
  loading: externalLoading,
}: GuestPaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createSetupIntent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/payments/guest-setup-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: guestEmail,
          name: guestName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to initialize payment form");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error("Error creating setup intent:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize payment form",
      );
    } finally {
      setLoading(false);
    }
  }, [guestEmail, guestName]);

  useEffect(() => {
    createSetupIntent();
  }, [createSetupIntent]);

  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#0f172a",
      borderRadius: "8px",
    },
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Payment Information Required
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Please enter your card details to continue with booking. Your card
          will only be charged after your appointment is confirmed by the
          professional.
        </p>
      </div>

      {/* Security Note */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>Your payment information is secured by Stripe</span>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">
            Preparing secure payment form...
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Error
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={createSetupIntent}
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && clientSecret && (
        <Elements
          options={{
            clientSecret,
            appearance,
          }}
          stripe={stripePromise}
        >
          <SetupForm
            onSuccess={onSuccess}
            onError={setError}
            loading={externalLoading}
          />
        </Elements>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} disabled={externalLoading}>
          Back
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Your card details are encrypted and never stored on our servers.
      </p>
    </div>
  );
}
