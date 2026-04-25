import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover",
  typescript: true,
});

// Platform fee percentage (10%)
export const PLATFORM_FEE_PERCENTAGE =
  parseInt(process.env.PLATFORM_FEE_PERCENTAGE || "10") / 100;

// Default currency
export const DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY || "CAD";

// Helper function to calculate platform fee
export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * PLATFORM_FEE_PERCENTAGE);
}

// Helper function to calculate professional payout
export function calculateProfessionalPayout(amount: number): number {
  return amount - calculatePlatformFee(amount);
}

// Convert amount to cents for Stripe (Stripe uses smallest currency unit)
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

// Convert amount from cents to dollars
export function fromCents(amount: number): number {
  return amount / 100;
}
