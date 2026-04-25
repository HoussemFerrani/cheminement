"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  orientation = "horizontal",
  className,
}: StepperProps) {
  return (
    <div
      className={cn(
        "w-full",
        orientation === "vertical" && "flex flex-col",
        className,
      )}
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal"
            ? "flex-row items-center justify-between"
            : "flex-col space-y-4",
        )}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <React.Fragment key={index}>
              <div
                className={cn(
                  "flex items-center",
                  orientation === "vertical" && "w-full",
                )}
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-background text-primary",
                    isUpcoming &&
                      "border-muted bg-background text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step Content */}
                <div
                  className={cn(
                    "ml-4 flex-1",
                    orientation === "horizontal" && "hidden sm:block",
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent && "text-foreground",
                      (isCompleted || isUpcoming) && "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "bg-border",
                    orientation === "horizontal"
                      ? "mx-2 h-0.5 flex-1"
                      : "ml-5 h-8 w-0.5",
                    index < currentStep && "bg-primary",
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

interface StepperContentProps {
  step: number;
  children: React.ReactNode;
}

export function StepperContent({ step, children }: StepperContentProps) {
  return <div data-step={step}>{children}</div>;
}

interface StepperActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function StepperActions({ children, className }: StepperActionsProps) {
  return (
    <div
      className={cn("flex items-center justify-between gap-4 mt-6", className)}
    >
      {children}
    </div>
  );
}
