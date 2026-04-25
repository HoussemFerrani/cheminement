"use client";

import { Chrome, Apple } from "lucide-react";

interface SocialLoginProps {
  mode?: "login" | "signup";
}

export function SocialLogin({ mode = "login" }: SocialLoginProps) {
  const text = mode === "signup" ? "Sign up with" : "Continue with";

  return (
    <>
      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card/50 text-muted-foreground font-light">
            Or {text}
          </span>
        </div>
      </div>

      {/* Social Login Options */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2 border border-border/20 rounded-lg text-foreground font-light hover:bg-accent transition-colors"
        >
          <Chrome className="w-5 h-5" />
          <span>Google</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2 border border-border/20 rounded-lg text-foreground font-light hover:bg-accent transition-colors"
        >
          <Apple className="w-5 h-5" />
          <span>Apple</span>
        </button>
      </div>
    </>
  );
}
