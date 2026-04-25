/**
 * Email notification utilities for appointment scheduling
 * Uses nodemailer with SMTP for sending emails
 * Configurable from admin portal via PlatformSettings
 */

import nodemailer from "nodemailer";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import PlatformSettings, {
  type EmailNotificationType,
  type IEmailSettings,
  type IEmailBranding,
  getDefaultEmailSettings,
} from "@/models/PlatformSettings";

// =============================================================================
// Types
// =============================================================================

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType?: string;
  }[];
}

interface BaseAppointmentData {
  date?: string;
  time?: string;
  duration: number;
  type: "video" | "in-person" | "phone" | "both";
}

interface AppointmentEmailData extends BaseAppointmentData {
  clientName: string;
  clientEmail: string;
  professionalName?: string;
  professionalEmail: string;
  meetingLink?: string;
  location?: string;
}

interface GuestBookingEmailData extends BaseAppointmentData {
  guestName: string;
  guestEmail: string;
  professionalName?: string;
  therapyType: "solo" | "couple" | "group";
  price: number;
  meetingLink?: string;
  paymentLink?: string;
  /** UI locale for service-request thank-you / onboarding copy */
  locale?: "fr" | "en";
  bookingFor?: "self" | "patient" | "loved-one";
  lovedOneIsMinor?: boolean;
}

interface MeetingLinkEmailData {
  guestName: string;
  guestEmail: string;
  professionalName?: string;
  date?: string;
  time?: string;
  duration: number;
  type: "video" | "in-person" | "phone" | "both";
  meetingLink: string;
}

interface WelcomeEmailData {
  name: string;
  email: string;
  role: "client" | "professional" | "guest";
  locale?: "fr" | "en";
}

interface AccountEmailVerificationData {
  name: string;
  email: string;
  verifyUrl: string;
}

interface PasswordResetEmailData {
  name: string;
  email: string;
  resetLink: string;
}

interface PaymentEmailData {
  name: string;
  email: string;
  amount: number;
  appointmentDate?: string;
  appointmentTime?: string;
  professionalName?: string;
}

interface ProfessionalStatusEmailData {
  name: string;
  email: string;
  reason?: string;
}

type EmailTheme = "success" | "info" | "warning" | "danger";

// =============================================================================
// Settings Cache
// =============================================================================

let cachedEmailSettings: IEmailSettings | null = null;
let settingsCacheTime: number = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache

async function getEmailSettings(): Promise<IEmailSettings> {
  const now = Date.now();

  // Return cached settings if still valid
  if (cachedEmailSettings && now - settingsCacheTime < CACHE_TTL_MS) {
    return cachedEmailSettings;
  }

  try {
    await connectToDatabase();
    const settings = await PlatformSettings.findOne().lean();

    if (settings?.emailSettings) {
      // Handle the templates Map from MongoDB
      const templates =
        settings.emailSettings.templates instanceof Map
          ? Object.fromEntries(settings.emailSettings.templates)
          : settings.emailSettings.templates;

      cachedEmailSettings = {
        ...settings.emailSettings,
        templates: templates as IEmailSettings["templates"],
      };
      settingsCacheTime = now;
      return cachedEmailSettings;
    }
  } catch (error) {
    console.error("Error fetching email settings:", error);
  }

  // Return defaults if database fetch fails
  return getDefaultEmailSettings();
}

// Clear cache (call when settings are updated)
export function clearEmailSettingsCache(): void {
  cachedEmailSettings = null;
  settingsCacheTime = 0;
}

// =============================================================================
// Configuration & Transport
// =============================================================================

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// =============================================================================
// Formatting Helpers
// =============================================================================

const formatEmailDate = (dateString?: string): string => {
  if (!dateString) return "To be scheduled";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "To be scheduled";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (time?: string): string => {
  return time || "To be scheduled";
};

const formatProfessionalName = (name?: string): string => {
  return name || "To be assigned";
};

const formatAppointmentType = (
  type: "video" | "in-person" | "phone" | "both",
  lang: "fr" | "en" = "en",
): string => {
  if (lang === "fr") {
    const fr: Record<string, string> = {
      video: "Appel vidéo",
      "in-person": "En personne",
      phone: "Appel téléphonique",
      both: "Ouvert pour les deux (vidéo ou en personne)",
    };
    return fr[type] || type;
  }
  const types: Record<string, string> = {
    video: "Video Call",
    "in-person": "In-Person",
    phone: "Phone Call",
    both: "Open to both (video or in-person)",
  };
  return types[type] || type;
};

const formatSessionType = (type?: "solo" | "couple" | "group"): string => {
  const types: Record<string, string> = {
    solo: "Individual Session",
    couple: "Couple Session",
    group: "Group Session",
  };
  return types[type || "solo"] || "Individual Session";
};

// =============================================================================
// Theme Colors (configurable via branding)
// =============================================================================

const getThemeColors = (
  theme: EmailTheme,
  branding?: IEmailBranding,
): { primary: string; secondary: string; bg: string; text: string } => {
  const primaryColor = branding?.primaryColor || "#8B7355";
  const secondaryColor = branding?.secondaryColor || "#6B5344";

  const themes = {
    success: {
      primary: "#22c55e",
      secondary: "#16a34a",
      bg: "#f0fdf4",
      text: "#166534",
    },
    info: {
      primary: primaryColor,
      secondary: secondaryColor,
      bg: "#faf8f6",
      text: "#5c4a3a",
    },
    warning: {
      primary: "#f59e0b",
      secondary: "#d97706",
      bg: "#fffbeb",
      text: "#92400e",
    },
    danger: {
      primary: "#ef4444",
      secondary: "#dc2626",
      bg: "#fef2f2",
      text: "#991b1b",
    },
  };

  return themes[theme] || themes.info;
};

// =============================================================================
// Email Template Components
// =============================================================================

const getBaseStyles = (branding?: IEmailBranding): string => {
  const primaryColor = branding?.primaryColor || "#8B7355";

  return `
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${primaryColor}; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #666; font-size: 14px; }
    .detail-value { font-weight: 600; color: #333; }
    .button { display: inline-block; background: linear-gradient(135deg, ${primaryColor} 0%, ${branding?.secondaryColor || "#6B5344"} 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: 500; }
    .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
    .footer a { color: ${primaryColor}; text-decoration: none; }
  `;
};

const createHeader = (
  title: string,
  subtitle?: string,
  theme: EmailTheme = "info",
  branding?: IEmailBranding,
): string => {
  const colors = getThemeColors(theme, branding);
  return `
    <div class="header" style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
      ${branding?.logoUrl ? `<img src="${branding.logoUrl}" alt="${branding.companyName}" style="max-height: 40px; margin-bottom: 15px;">` : ""}
      <h1 style="margin: 0; font-weight: 300; font-size: 28px;">${title}</h1>
      ${subtitle ? `<p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">${subtitle}</p>` : ""}
    </div>
  `;
};

const createDetailRow = (
  label: string,
  value: string,
  isLink = false,
  branding?: IEmailBranding,
): string => {
  const primaryColor = branding?.primaryColor || "#8B7355";
  const valueHtml = isLink
    ? `<a href="${value}" style="color: ${primaryColor};">${value.includes("Join") ? "Join Session" : value}</a>`
    : value;
  return `
    <div class="detail-row">
      <span class="detail-label">${label}</span>
      <span class="detail-value">${valueHtml}</span>
    </div>
  `;
};

const createDetailsSection = (
  details: Array<{ label: string; value: string; isLink?: boolean }>,
  borderColor = "#8B7355",
  branding?: IEmailBranding,
): string => {
  const rows = details
    .map((d) => createDetailRow(d.label, d.value, d.isLink, branding))
    .join("");
  return `<div class="details" style="border-left-color: ${borderColor};">${rows}</div>`;
};

const createPriceSection = (
  amount: number,
  note: string,
  theme: EmailTheme = "info",
  currency: string,
  branding?: IEmailBranding,
): string => {
  const colors = getThemeColors(theme, branding);
  return `
    <div style="background: ${colors.primary}; color: white; padding: 15px 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <div style="font-size: 24px; font-weight: 600;">$${amount.toFixed(2)} ${currency}</div>
      <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">${note}</div>
    </div>
  `;
};

const createInfoBox = (
  title: string,
  content: string,
  theme: EmailTheme = "info",
  branding?: IEmailBranding,
): string => {
  const colors = getThemeColors(theme, branding);
  return `
    <div style="background: ${colors.bg}; border: 1px solid ${colors.primary}40; padding: 15px 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px; color: ${colors.primary}; font-size: 16px;">${title}</h3>
      <p style="margin: 0; color: ${colors.text}; font-size: 14px;">${content}</p>
    </div>
  `;
};

const createButton = (
  text: string,
  url: string,
  branding?: IEmailBranding,
): string => {
  const primaryColor = branding?.primaryColor || "#8B7355";
  const secondaryColor = branding?.secondaryColor || "#6B5344";
  return `<div style="text-align: center;"><a href="${url}" style="display: inline-block; background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: 500;">${text}</a></div>`;
};

const createFooter = (branding?: IEmailBranding): string => {
  const year = new Date().getFullYear();
  const url = process.env.NEXTAUTH_URL || "";
  const companyName = branding?.companyName || "JeChemine";
  const footerText =
    branding?.footerText || "Your journey to wellness starts here.";
  const primaryColor = branding?.primaryColor || "#8B7355";

  return `
    <div class="footer">
      <p style="margin: 0 0 5px;">${footerText}</p>
      <p style="margin: 0;">&copy; ${year} ${companyName}. All rights reserved.</p>
      <p style="margin: 10px 0 0;"><a href="${url}" style="color: ${primaryColor};">Visit our website</a></p>
    </div>
  `;
};

const createBadge = (
  text: string,
  theme: EmailTheme = "success",
  branding?: IEmailBranding,
): string => {
  const colors = getThemeColors(theme, branding);
  return `<span style="display: inline-block; background: ${colors.bg}; color: ${colors.text}; padding: 8px 16px; border-radius: 20px; font-size: 14px;">${text}</span>`;
};

// =============================================================================
// Email Template Builder
// =============================================================================

interface EmailTemplateOptions {
  title: string;
  subtitle?: string;
  theme?: EmailTheme;
  greeting: string;
  intro: string;
  details?: Array<{ label: string; value: string; isLink?: boolean }>;
  detailsBorderColor?: string;
  price?: { amount: number; note: string; theme?: EmailTheme; currency?: string };
  infoBox?: { title: string; content: string; theme?: EmailTheme };
  badge?: { text: string; theme?: EmailTheme };
  button?: { text: string; url: string };
  /** Optional second CTA (e.g. invite guest to create a full client account) */
  secondaryButton?: { preamble?: string; text: string; url: string };
  outro?: string;
  branding?: IEmailBranding;
}

const buildEmailHtml = (options: EmailTemplateOptions): string => {
  const {
    title,
    subtitle,
    theme = "info",
    greeting,
    intro,
    details,
    detailsBorderColor,
    price,
    infoBox,
    badge,
    button,
    secondaryButton,
    outro,
    branding,
  } = options;

  const colors = getThemeColors(theme, branding);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${getBaseStyles(branding)}</style>
      </head>
      <body>
        <div class="container">
          ${createHeader(title, subtitle, theme, branding)}
          <div class="content">
            ${badge ? `<div style="text-align: center; margin-bottom: 20px;">${createBadge(badge.text, badge.theme, branding)}</div>` : ""}
            <p>${greeting}</p>
            <p>${intro}</p>
            ${details ? createDetailsSection(details, detailsBorderColor || colors.primary, branding) : ""}
            ${price ? createPriceSection(price.amount, price.note, price.theme || theme, price.currency!, branding) : ""}
            ${infoBox ? createInfoBox(infoBox.title, infoBox.content, infoBox.theme, branding) : ""}
            ${button ? createButton(button.text, button.url, branding) : ""}
            ${
              secondaryButton
                ? `
            <div style="margin-top: 28px; padding-top: 24px; border-top: 1px solid #eee;">
              ${secondaryButton.preamble ? `<p style="margin: 0 0 16px; font-size: 15px; color: #333;">${secondaryButton.preamble}</p>` : ""}
              ${createButton(secondaryButton.text, secondaryButton.url, branding)}
            </div>`
                : ""
            }
            ${outro ? `<p style="color: #666; font-size: 14px;">${outro}</p>` : ""}
          </div>
          ${createFooter(branding)}
        </div>
      </body>
    </html>
  `;
};

const buildEmailText = (sections: string[]): string => {
  return (
    sections.filter(Boolean).join("\n\n") +
    `\n\n© ${new Date().getFullYear()} JeChemine. All rights reserved.`
  );
};

// =============================================================================
// Email Sender
// =============================================================================

const sendEmail = async (
  data: EmailData,
  emailType: EmailNotificationType,
): Promise<boolean> => {
  try {
    const settings = await getEmailSettings();

    // Check if emails are globally enabled
    if (!settings.enabled) {
      console.log("Email notifications are disabled globally");
      return false;
    }

    // Check if this specific email type is enabled
    const templateConfig = settings.templates[emailType];
    if (templateConfig && !templateConfig.enabled) {
      console.log(`Email type "${emailType}" is disabled`);
      return false;
    }

    // Check SMTP configuration
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      console.log("SMTP not configured. Email would be sent:", {
        to: data.to,
        subject: data.subject,
        type: emailType,
      });
      return true;
    }

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${settings.branding?.companyName || "JeChemine"}" <${process.env.SMTP_USER}>`,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
      attachments: data.attachments,
    });

    console.log(`Email sent successfully [${emailType}] to:`, data.to);
    return true;
  } catch (error) {
    console.error(`Error sending email [${emailType}]:`, error);
    return false;
  }
};

// Helper to get subject from settings or use default
async function getSubject(
  emailType: EmailNotificationType,
  defaultSubject: string,
): Promise<string> {
  const settings = await getEmailSettings();
  return settings.templates[emailType]?.subject || defaultSubject;
}

// Helper to get currency
async function getCurrency(): Promise<string> {
  try {
    await connectToDatabase();
    const settings = await PlatformSettings.findOne().lean();
    return settings?.currency || "CAD";
  } catch {
    return "CAD";
  }
}

// Helper to get branding
async function getBranding(): Promise<IEmailBranding | undefined> {
  try {
    await connectToDatabase();
    const settings = await PlatformSettings.findOne().lean();
    return settings?.emailSettings?.branding;
  } catch {
    return undefined;
  }
}

// =============================================================================
// Public Email Functions - Authentication
// =============================================================================

export async function sendAccountEmailVerificationEmail(
  data: AccountEmailVerificationData,
): Promise<boolean> {
  const branding = await getBranding();
  const html = buildEmailHtml({
    title: "Confirmez votre adresse courriel",
    subtitle: "Lien valide 15 minutes",
    theme: "info",
    greeting: `Bonjour ${data.name},`,
    intro:
      "Pour sécuriser votre compte, veuillez confirmer votre adresse courriel en cliquant sur le bouton ci-dessous. Ensuite, vous devrez valider votre numéro de téléphone par code SMS.",
    button: { text: "Confirmer mon courriel", url: data.verifyUrl },
    outro:
      "Si vous n’êtes pas à l’origine de cette inscription, ignorez ce message.",
    branding,
  });
  const text = buildEmailText([
    "Confirmez votre adresse courriel",
    `Bonjour ${data.name},`,
    "Ouvrez ce lien (valide 15 minutes) pour continuer :",
    data.verifyUrl,
  ]);
  const subject = await getSubject(
    "email_verification",
    "Confirmez votre courriel - JeChemine",
  );
  return sendEmail(
    { to: data.email, subject, html, text },
    "email_verification",
  );
}

export async function sendWelcomeEmail(
  data: WelcomeEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/${data.role}/dashboard`;

  const roleMessages: Record<string, string> = {
    client:
      "You can now browse professionals, book appointments, and access resources to support your wellness journey.",
    professional:
      "Your account is pending approval. Once approved, you'll be able to manage appointments, connect with clients, and grow your practice.",
    guest: "You can track your appointment and receive updates via email.",
  };

  const html = buildEmailHtml({
    title: "Welcome!",
    subtitle: `You've joined ${branding?.companyName || "JeChemine"}`,
    theme: "success",
    greeting: `Dear ${data.name},`,
    intro: `Thank you for creating an account with us. ${roleMessages[data.role] || ""}`,
    button:
      data.role !== "guest"
        ? { text: "Go to Dashboard", url: dashboardUrl }
        : undefined,
    outro:
      "If you have any questions, please don't hesitate to reach out to our support team.",
    branding,
  });

  const text = buildEmailText([
    `Welcome to ${branding?.companyName || "JeChemine"}!`,
    `Dear ${data.name},`,
    `Thank you for creating an account with us.`,
    roleMessages[data.role] || "",
    data.role !== "guest" ? `Visit your dashboard: ${dashboardUrl}` : "",
  ]);

  const subject = await getSubject("welcome", "Welcome to JeChemine!");

  return sendEmail({ to: data.email, subject, html, text }, "welcome");
}

export async function sendPasswordResetEmail(
  data: PasswordResetEmailData,
): Promise<boolean> {
  const branding = await getBranding();

  const html = buildEmailHtml({
    title: "Reset Your Password",
    theme: "info",
    greeting: `Dear ${data.name},`,
    intro:
      "We received a request to reset your password. Click the button below to create a new password.",
    button: { text: "Reset Password", url: data.resetLink },
    infoBox: {
      title: "Didn't request this?",
      content:
        "If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.",
      theme: "warning",
    },
    outro: "This link will expire in 1 hour for security reasons.",
    branding,
  });

  const text = buildEmailText([
    "Password Reset Request",
    `Dear ${data.name},`,
    "We received a request to reset your password.",
    `Reset your password: ${data.resetLink}`,
    "This link will expire in 1 hour.",
    "If you didn't request this, you can safely ignore this email.",
  ]);

  const subject = await getSubject(
    "password_reset",
    "Reset Your Password - JeChemine",
  );

  return sendEmail({ to: data.email, subject, html, text }, "password_reset");
}

// =============================================================================
// Public Email Functions - Guest Booking
// =============================================================================

export async function sendGuestBookingConfirmation(
  data: GuestBookingEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const baseUrl = process.env.NEXTAUTH_URL || "";
  const memberSignupUrl = `${baseUrl}/signup/member?email=${encodeURIComponent(data.guestEmail)}`;
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const professionalName = formatProfessionalName(data.professionalName);
  const sessionType = formatSessionType(data.therapyType);
  const isPendingSchedule = !data.date || !data.time || !data.professionalName;
  const lang: "fr" | "en" = data.locale === "fr" ? "fr" : "en";
  const appointmentType = formatAppointmentType(data.type, lang);

  const isSelfServiceRequest =
    isPendingSchedule && data.bookingFor === "self";

  if (isSelfServiceRequest) {
    const intro =
      lang === "fr"
        ? "Merci de votre demande. Pour accélérer votre jumelage, complétez votre profil en suivant le lien ci-dessous."
        : "Thank you for your request. To speed up your matching, complete your profile using the link below.";

    const nextSteps =
      lang === "fr"
        ? "Un professionnel vous sera proposé sous peu. Vous recevrez un autre courriel lorsque votre demande progressera."
        : "A professional will be assigned to you soon. You will receive another email as your request moves forward.";

    const detailLabels =
      lang === "fr"
        ? {
            session: "Type de séance",
            modality: "Modalité",
            professional: "Professionnel",
            date: "Date",
            time: "Heure",
            duration: "Durée",
          }
        : {
            session: "Session type",
            modality: "Modality",
            professional: "Professional",
            date: "Date",
            time: "Time",
            duration: "Duration",
          };

    const html = buildEmailHtml({
      title:
        lang === "fr" ? "Demande de service reçue" : "Service request received",
      subtitle:
        lang === "fr"
          ? "Nous traitons votre demande"
          : "We are processing your request",
      theme: "info",
      badge: {
        text: lang === "fr" ? "⏳ En attente de jumelage" : "⏳ Pending matching",
        theme: "warning",
      },
      greeting:
        lang === "fr"
          ? `Bonjour ${data.guestName},`
          : `Dear ${data.guestName},`,
      intro,
      details: [
        { label: detailLabels.session, value: sessionType },
        { label: detailLabels.modality, value: appointmentType },
        { label: detailLabels.professional, value: professionalName },
        { label: detailLabels.date, value: formattedDate },
        { label: detailLabels.time, value: formattedTime },
        {
          label: detailLabels.duration,
          value:
            lang === "fr"
              ? `${data.duration} minutes`
              : `${data.duration} minutes`,
        },
      ],
      infoBox: {
        title: lang === "fr" ? "Ensuite" : "Next steps",
        content: nextSteps,
      },
      button: {
        text:
          lang === "fr"
            ? "Compléter mon profil (onboarding)"
            : "Complete my profile (onboarding)",
        url: memberSignupUrl,
      },
      secondaryButton: {
        preamble:
          lang === "fr"
            ? "Vous pouvez aussi créer un compte membre sécurisé avec la même adresse courriel pour suivre vos rendez-vous."
            : "You can also create a secure member account with the same email to track your appointments.",
        text:
          lang === "fr" ? "Créer mon compte membre" : "Create my member account",
        url: memberSignupUrl,
      },
      outro:
        lang === "fr"
          ? "Merci de votre confiance."
          : "Thank you for choosing us.",
      branding,
    });

    const text = buildEmailText([
      lang === "fr" ? "Demande de service reçue" : "Service request received",
      lang === "fr"
        ? `Bonjour ${data.guestName},`
        : `Dear ${data.guestName},`,
      intro,
      `${detailLabels.session}: ${sessionType}`,
      `${detailLabels.modality}: ${appointmentType}`,
      nextSteps,
      lang === "fr" ? "Lien onboarding (profil)" : "Onboarding link (profile)",
      memberSignupUrl,
    ]);

    const subject =
      lang === "fr"
        ? "Merci pour votre demande — Je Chemine"
        : "Thank you for your request — Je Chemine";

    return sendEmail(
      { to: data.guestEmail, subject, html, text },
      "guest_booking_confirmation",
    );
  }

  // Loved-one booking (pending assignment):
  // - child (<18): send onboarding link to the requester immediately
  // - adult (>18): keep dossier pending until admin decides where to send the link
  if (isPendingSchedule && data.bookingFor === "loved-one") {
    if (data.lovedOneIsMinor) {
      const intro =
        lang === "fr"
          ? "Merci de votre demande. Pour accélérer votre jumelage, complétez votre profil en suivant le lien ci-dessous."
          : "Thank you for your request. To speed up your matching, complete your profile using the link below.";

      const nextSteps =
        lang === "fr"
          ? "Un professionnel vous sera proposé sous peu."
          : "A professional will be assigned to you soon.";

      const detailLabels =
        lang === "fr"
          ? {
              session: "Type de séance",
              modality: "Modalité",
              professional: "Professionnel",
              date: "Date",
              time: "Heure",
              duration: "Durée",
            }
          : {
              session: "Session type",
              modality: "Modality",
              professional: "Professional",
              date: "Date",
              time: "Time",
              duration: "Duration",
            };

      const html = buildEmailHtml({
        title: lang === "fr" ? "Demande de service reçue" : "Service request received",
        subtitle: lang === "fr" ? "Nous traitons votre demande" : "We are processing your request",
        theme: "info",
        badge: {
          text: lang === "fr" ? "⏳ En attente de jumelage" : "⏳ Pending matching",
          theme: "warning",
        },
        greeting: lang === "fr" ? `Bonjour ${data.guestName},` : `Dear ${data.guestName},`,
        intro,
        details: [
          { label: detailLabels.session, value: sessionType },
          { label: detailLabels.modality, value: appointmentType },
          { label: detailLabels.professional, value: professionalName },
          { label: detailLabels.date, value: formattedDate },
          { label: detailLabels.time, value: formattedTime },
          { label: detailLabels.duration, value: `${data.duration} minutes` },
        ],
        infoBox: {
          title: lang === "fr" ? "Ensuite" : "Next steps",
          content: nextSteps,
        },
        button: {
          text: lang === "fr" ? "Compléter mon profil (onboarding)" : "Complete my profile (onboarding)",
          url: memberSignupUrl,
        },
        branding,
      });

      const text = buildEmailText([
        lang === "fr" ? "Demande de service reçue" : "Service request received",
        lang === "fr" ? `Bonjour ${data.guestName},` : `Dear ${data.guestName},`,
        intro,
        `Duration: ${data.duration} minutes`,
        nextSteps,
        lang === "fr" ? "Lien onboarding (profil)" : "Onboarding link (profile)",
        memberSignupUrl,
      ]);

      const subject =
        lang === "fr"
          ? "Merci pour votre demande — Je Chemine"
          : "Thank you for your request — Je Chemine";

      return sendEmail(
        { to: data.guestEmail, subject, html, text },
        "guest_booking_confirmation",
      );
    }

    // Adult (>18): no onboarding link until admin decision
    const intro =
      lang === "fr"
        ? "Merci de votre demande. Votre dossier est en attente de validation par l’Admin. Selon votre situation, le lien de compte sera envoyé au demandeur ou directement au proche."
        : "Thank you for your request. Your file is pending admin validation. Depending on your situation, the account link will be sent to the requester or directly to the loved one.";

    const nextSteps =
      lang === "fr"
        ? "Un administrateur examinera votre demande avant l’envoi du lien de compte."
        : "An admin will review your request before sending the account link.";

    const html = buildEmailHtml({
      title: lang === "fr" ? "Demande de service reçue" : "Service request received",
      subtitle: lang === "fr" ? "Nous traitons votre demande" : "We are processing your request",
      theme: "info",
      badge: {
        text: lang === "fr" ? "⏳ En attente de validation" : "⏳ Pending admin validation",
        theme: "warning",
      },
      greeting: lang === "fr" ? `Bonjour ${data.guestName},` : `Dear ${data.guestName},`,
      intro,
      details: [
        { label: "Type de séance", value: sessionType },
        { label: "Type de rendez-vous", value: appointmentType },
        { label: "Professionnel", value: professionalName },
        { label: "Date", value: formattedDate },
        { label: "Heure", value: formattedTime },
        { label: "Durée", value: `${data.duration} minutes` },
      ],
      infoBox: {
        title: lang === "fr" ? "Ensuite" : "Next steps",
        content: nextSteps,
      },
      branding,
    });

    const text = buildEmailText([
      lang === "fr" ? "Demande de service reçue" : "Service request received",
      lang === "fr" ? `Bonjour ${data.guestName},` : `Dear ${data.guestName},`,
      intro,
      nextSteps,
    ]);

    const subject =
      lang === "fr"
        ? "Demande en attente de validation — Je Chemine"
        : "Request pending admin validation — Je Chemine";

    return sendEmail(
      { to: data.guestEmail, subject, html, text },
      "guest_booking_confirmation",
    );
  }

  const intro = isPendingSchedule
    ? "We've received your booking request and will match you with a professional shortly."
    : "Your booking request has been received and is being processed.";

  const nextSteps = isPendingSchedule
    ? "A professional will be assigned to you soon. You'll receive another email with payment details once confirmed."
    : "Please wait for confirmation from your assigned professional. You'll receive payment instructions once your appointment is confirmed.";

  const appointmentTypeEn = formatAppointmentType(data.type, "en");

  const html = buildEmailHtml({
    title: "Booking Request Received",
    subtitle: isPendingSchedule
      ? "We'll find the right professional for you"
      : "Your session details",
    theme: "info",
    badge: {
      text: isPendingSchedule
        ? "⏳ Pending Assignment"
        : "📅 Awaiting Confirmation",
      theme: "warning",
    },
    greeting: `Dear ${data.guestName},`,
    intro,
    details: [
      { label: "Session Type", value: sessionType },
      { label: "Appointment Type", value: appointmentTypeEn },
      { label: "Professional", value: professionalName },
      { label: "Date", value: formattedDate },
      { label: "Time", value: formattedTime },
      { label: "Duration", value: `${data.duration} minutes` },
    ],
    infoBox: {
      title: "Next Steps",
      content: nextSteps,
    },
    secondaryButton: {
      preamble:
        "Create your secure Je Chemine member account with the same email you used for this request. You will complete your detailed profile (basic clinical information) to help your professional prepare for your care.",
      text: "Create my secure account",
      url: memberSignupUrl,
    },
    outro:
      "Thank you for choosing us. We'll be in touch soon with more details.",
    branding,
  });

  const textNextSteps = isPendingSchedule
    ? [
        "NEXT STEPS:",
        "1. A professional will be assigned to you soon",
        "2. You'll receive confirmation with payment details",
        "3. Complete payment to secure your appointment",
        "4. Receive your meeting link before the session",
      ]
    : [
        "NEXT STEPS:",
        "1. Wait for professional confirmation",
        "2. You'll receive payment instructions once confirmed",
        "3. Complete payment to secure your appointment",
        "4. Receive your meeting link before the session",
      ];

  const text = buildEmailText([
    "Booking Request Received",
    `Dear ${data.guestName},`,
    intro,
    "SESSION DETAILS:",
    `Session Type: ${sessionType}`,
    `Appointment Type: ${appointmentTypeEn}`,
    `Professional: ${professionalName}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    `Duration: ${data.duration} minutes`,
    ...textNextSteps,
    "CREATE YOUR SECURE ACCOUNT:",
    "Use the link below to register and complete your detailed clinical profile (same email as this request):",
    memberSignupUrl,
  ]);

  const subject = await getSubject(
    "guest_booking_confirmation",
    "Booking Request Received - JeChemine",
  );

  return sendEmail(
    { to: data.guestEmail, subject, html, text },
    "guest_booking_confirmation",
  );
}

// =============================================================================
// Public Email Functions - Service request onboarding link (admin approval)
// =============================================================================

export async function sendServiceRequestOnboardingEmail(data: {
  toName: string;
  toEmail: string;
  locale?: "fr" | "en";
}): Promise<boolean> {
  const branding = await getBranding();
  const lang: "fr" | "en" = data.locale === "fr" ? "fr" : "en";
  const baseUrl = process.env.NEXTAUTH_URL || "";
  const memberSignupUrl = `${baseUrl}/signup/member?email=${encodeURIComponent(
    data.toEmail,
  )}`;

  const intro =
    lang === "fr"
      ? "Merci de votre demande. Pour accélérer votre jumelage, complétez votre profil ici."
      : "Thank you for your request. To speed up your matching, complete your profile here.";

  const html = buildEmailHtml({
    title: lang === "fr" ? "Demande reçue" : "Request received",
    subtitle: lang === "fr" ? "Onboarding du profil" : "Profile onboarding",
    theme: "info",
    badge: {
      text: lang === "fr" ? "✅ Action requise" : "✅ Action needed",
      theme: "success",
    },
    greeting: lang === "fr" ? `Bonjour ${data.toName},` : `Dear ${data.toName},`,
    intro,
    infoBox: {
      title: lang === "fr" ? "Étapes suivantes" : "Next steps",
      content:
        lang === "fr"
          ? "Complétez votre profil pour accélérer votre jumelage."
          : "Complete your profile to speed up your matching.",
    },
    button: {
      text:
        lang === "fr" ? "Compléter votre profil" : "Complete your profile",
      url: memberSignupUrl,
    },
    outro: lang === "fr" ? "Merci de votre confiance." : "Thank you for your trust.",
    branding,
  });

  const text = buildEmailText([
    lang === "fr" ? "Demande reçue" : "Request received",
    lang === "fr" ? `Bonjour ${data.toName},` : `Dear ${data.toName},`,
    intro,
    lang === "fr" ? "Lien onboarding :" : "Onboarding link:",
    memberSignupUrl,
    lang === "fr"
      ? "Complétez votre profil pour accélérer votre jumelage."
      : "Complete your profile to speed up your matching.",
  ]);

  const subject =
    lang === "fr"
      ? "Merci pour votre demande — Je Chemine"
      : "Thank you for your request — Je Chemine";

  return sendEmail(
    { to: data.toEmail, subject, html, text },
    "service_request_onboarding",
  );
}

export async function sendGuestPaymentConfirmation(
  data: GuestBookingEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const currency = await getCurrency();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const professionalName = formatProfessionalName(data.professionalName);
  const sessionType = formatSessionType(data.therapyType);
  const appointmentType = formatAppointmentType(data.type);

  const details = [
    { label: "Session Type", value: sessionType },
    { label: "Appointment Type", value: appointmentType },
    { label: "Professional", value: professionalName },
    { label: "Date", value: formattedDate },
    { label: "Time", value: formattedTime },
    { label: "Duration", value: `${data.duration} minutes` },
  ];

  const html = buildEmailHtml({
    title: "Next step: confirm your appointment",
    subtitle: "Your professional has confirmed your session",
    theme: "info",
    badge: { text: "✅ Appointment Confirmed", theme: "success" },
    greeting: `Dear ${data.guestName},`,
    intro:
      "Your appointment is confirmed. Open the secure link below to add your payment details (card, Interac e-Transfer where available through Stripe, or Canadian pre-authorized debit). Nothing is charged until after your session has taken place and your professional marks it as completed. Stripe processes your banking information — we do not store it.",
    details,
    detailsBorderColor: branding?.primaryColor,
    price: {
      amount: data.price,
      note: "Session fee (charged after the completed meeting)",
      theme: "info",
      currency,
    },
    button: data.paymentLink
      ? { text: "Confirm with payment details", url: data.paymentLink }
      : undefined,
    infoBox: {
      title: "Secure payments with Stripe",
      content:
        "After your payment method is registered, you can access your meeting link. Payment is processed only once the session is completed.",
    },
    outro:
      "If you need help, contact us using the information on our website.",
    branding,
  });

  const text = buildEmailText([
    "Confirm your appointment (payment after session)",
    `Dear ${data.guestName},`,
    "Your appointment has been confirmed. Use your personal link to add a payment method. You will only be charged after the session is completed. Stripe handles your bank details.",
    "SESSION DETAILS:",
    `Session Type: ${sessionType}`,
    `Appointment Type: ${appointmentType}`,
    `Professional: ${professionalName}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    `Duration: ${data.duration} minutes`,
    `Amount Due: $${data.price.toFixed(2)} ${currency}`,
    data.paymentLink ? `Complete payment: ${data.paymentLink}` : "",
  ]);

  const subject = await getSubject(
    "guest_payment_confirmation",
    "Your appointment is confirmed — next step inside",
  );

  return sendEmail(
    { to: data.guestEmail, subject, html, text },
    "guest_payment_confirmation",
  );
}

export async function sendGuestPaymentComplete(
  data: GuestBookingEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const currency = await getCurrency();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const professionalName = formatProfessionalName(data.professionalName);
  const sessionType = formatSessionType(data.therapyType);
  const appointmentType = formatAppointmentType(data.type);

  const details: Array<{ label: string; value: string; isLink?: boolean }> = [
    { label: "Session Type", value: sessionType },
    { label: "Appointment Type", value: appointmentType },
    { label: "Professional", value: professionalName },
    { label: "Date", value: formattedDate },
    { label: "Time", value: formattedTime },
    { label: "Duration", value: `${data.duration} minutes` },
  ];

  if (data.meetingLink) {
    details.push({
      label: "Meeting Link",
      value: data.meetingLink,
      isLink: true,
    });
  }

  const html = buildEmailHtml({
    title: "Payment Confirmed",
    subtitle: "You're all set for your session",
    theme: "success",
    badge: { text: "💳 Payment Complete", theme: "success" },
    greeting: `Dear ${data.guestName},`,
    intro:
      "Thank you! Your payment has been successfully processed. Your appointment is now fully confirmed.",
    details,
    detailsBorderColor: "#22c55e",
    price: {
      amount: data.price,
      note: "Payment received - Thank you!",
      theme: "success",
      currency,
    },
    button: data.meetingLink
      ? { text: "Join Session", url: data.meetingLink }
      : undefined,
    infoBox: {
      title: "Before Your Session",
      content: data.meetingLink
        ? "Your meeting link is ready. Make sure to join a few minutes early and ensure you have a stable internet connection."
        : "Your meeting link will be sent to you before your scheduled session time.",
    },
    outro:
      "We look forward to supporting you on your wellness journey. If you need to reschedule, please contact us at least 24 hours in advance.",
    branding,
  });

  const text = buildEmailText([
    "Payment Confirmed - You're All Set!",
    `Dear ${data.guestName},`,
    "Your payment has been processed successfully.",
    "APPOINTMENT DETAILS:",
    `Session Type: ${sessionType}`,
    `Professional: ${professionalName}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    `Duration: ${data.duration} minutes`,
    `Amount Paid: $${data.price.toFixed(2)} ${currency}`,
    data.meetingLink ? `Meeting Link: ${data.meetingLink}` : "",
  ]);

  const subject = await getSubject(
    "guest_payment_complete",
    "Payment Confirmed - JeChemine",
  );

  return sendEmail(
    { to: data.guestEmail, subject, html, text },
    "guest_payment_complete",
  );
}

// =============================================================================
// Public Email Functions - Appointments
// =============================================================================

export async function sendAppointmentConfirmation(
  data: AppointmentEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const professionalName = formatProfessionalName(data.professionalName);
  const appointmentType = formatAppointmentType(data.type);

  const details: Array<{ label: string; value: string; isLink?: boolean }> = [
    { label: "Professional", value: professionalName },
    { label: "Date", value: formattedDate },
    { label: "Time", value: formattedTime },
    { label: "Duration", value: `${data.duration} minutes` },
  ];

  if (data.meetingLink) {
    details.push({
      label: "Meeting Link",
      value: data.meetingLink,
      isLink: true,
    });
  } else if (data.location) {
    details.push({ label: "Location", value: data.location });
  }

  const html = buildEmailHtml({
    title: "Appointment Confirmed",
    theme: "success",
    greeting: `Dear ${data.clientName},`,
    intro: `Your ${appointmentType.toLowerCase()} appointment has been confirmed.`,
    details,
    button: data.meetingLink
      ? { text: "Join Session", url: data.meetingLink }
      : undefined,
    outro:
      "If you need to reschedule or cancel, please do so at least 24 hours in advance.",
    branding,
  });

  const text = buildEmailText([
    "Appointment Confirmed",
    `Dear ${data.clientName},`,
    `Your ${appointmentType.toLowerCase()} appointment has been confirmed.`,
    "DETAILS:",
    `Professional: ${professionalName}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    `Duration: ${data.duration} minutes`,
    data.meetingLink ? `Meeting Link: ${data.meetingLink}` : "",
    data.location ? `Location: ${data.location}` : "",
  ]);

  const subject = await getSubject(
    "appointment_confirmation",
    "Appointment Confirmed - JeChemine",
  );

  return sendEmail(
    { to: data.clientEmail, subject, html, text },
    "appointment_confirmation",
  );
}

export async function sendPaymentInvitation(
  data: AppointmentEmailData & { price: number; paymentUrl?: string },
): Promise<boolean> {
  const branding = await getBranding();
  const currency = await getCurrency();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const professionalName = formatProfessionalName(data.professionalName);
  const appointmentType = formatAppointmentType(data.type);
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/client/dashboard/appointments`;

  const details: Array<{ label: string; value: string; isLink?: boolean }> = [
    { label: "Professional", value: professionalName },
    { label: "Date", value: formattedDate },
    { label: "Time", value: formattedTime },
    { label: "Duration", value: `${data.duration} minutes` },
  ];

  if (data.meetingLink) {
    details.push({
      label: "Meeting Link",
      value: data.meetingLink,
      isLink: true,
    });
  } else if (data.location) {
    details.push({ label: "Location", value: data.location });
  }

  const html = buildEmailHtml({
    title: "Next step: confirm your appointment",
    subtitle: "Your professional has confirmed your session",
    theme: "info",
    badge: { text: "✅ Appointment Confirmed", theme: "success" },
    greeting: `Dear ${data.clientName},`,
    intro:
      "Your appointment is confirmed. Please add your payment details (card, Interac e-Transfer where available through Stripe, or Canadian pre-authorized debit) to finalize your booking. Nothing is charged until after your session has taken place and your professional marks it as completed. Card and banking data are processed by Stripe — we do not store them on our platform.",
    details,
    detailsBorderColor: branding?.primaryColor,
    price: {
      amount: data.price,
      note: "Session fee (charged after the completed meeting)",
      theme: "info",
      currency,
    },
    button: data.paymentUrl
      ? { text: "Open billing & confirm", url: data.paymentUrl }
      : { text: "View Appointment", url: dashboardUrl },
    infoBox: {
      title: "Secure payments with Stripe",
      content:
        "You will receive your meeting link once your payment method is on file. The amount is collected only after your professional confirms that the session occurred.",
    },
    outro:
      "If you have questions, reply to this email or contact support from your dashboard.",
    branding,
  });

  const text = buildEmailText([
    "Confirm your appointment (payment after session)",
    `Dear ${data.clientName},`,
    "Your appointment has been confirmed. Add your payment method from the link below to confirm your booking. You will only be charged after your session is marked as completed. Stripe handles your card and bank details; we do not store them.",
    "APPOINTMENT DETAILS:",
    `Professional: ${professionalName}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    `Duration: ${data.duration} minutes`,
    `Amount Due: $${data.price.toFixed(2)} ${currency}`,
    data.paymentUrl
      ? `Complete payment: ${data.paymentUrl}`
      : `View appointment: ${dashboardUrl}`,
  ]);

  const subject = await getSubject(
    "payment_invitation",
    "Your appointment is confirmed — next step inside",
  );

  return sendEmail(
    { to: data.clientEmail, subject, html, text },
    "payment_invitation",
  );
}

export async function sendProfessionalNotification(
  data: AppointmentEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const professionalName = formatProfessionalName(data.professionalName);
  const appointmentType = formatAppointmentType(data.type);
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/professional/dashboard/requests`;

  const html = buildEmailHtml({
    title: "New Appointment Request",
    theme: "info",
    greeting: `Dear ${professionalName},`,
    intro:
      "You have received a new appointment request. Please review the details below.",
    details: [
      { label: "Client", value: data.clientName },
      { label: "Email", value: data.clientEmail },
      { label: "Type", value: appointmentType },
      { label: "Date", value: formattedDate },
      { label: "Time", value: formattedTime },
    ],
    button: { text: "View Request", url: dashboardUrl },
    outro:
      "Please respond to this request as soon as possible to confirm or reschedule.",
    branding,
  });

  const text = buildEmailText([
    "New Appointment Request",
    `Dear ${professionalName},`,
    "You have a new appointment request.",
    "CLIENT DETAILS:",
    `Client: ${data.clientName}`,
    `Email: ${data.clientEmail}`,
    `Type: ${appointmentType}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    `View requests: ${dashboardUrl}`,
  ]);

  const subject = await getSubject(
    "appointment_professional_notification",
    "New Appointment Request - JeChemine",
  );

  return sendEmail(
    { to: data.professionalEmail, subject, html, text },
    "appointment_professional_notification",
  );
}

export async function sendAppointmentReminder(
  data: AppointmentEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const professionalName = formatProfessionalName(data.professionalName);

  const details: Array<{ label: string; value: string; isLink?: boolean }> = [
    { label: "Professional", value: professionalName },
    { label: "Date", value: formattedDate },
    { label: "Time", value: formattedTime },
  ];

  if (data.meetingLink) {
    details.push({
      label: "Meeting Link",
      value: data.meetingLink,
      isLink: true,
    });
  }

  const html = buildEmailHtml({
    title: "Appointment Reminder",
    theme: "warning",
    greeting: `Dear ${data.clientName},`,
    intro: "This is a friendly reminder about your upcoming appointment.",
    details,
    infoBox: {
      title: "Prepare for Your Session",
      content:
        "Please ensure you're in a quiet, private space with a stable internet connection. Join a few minutes early to test your audio and video.",
      theme: "info",
    },
    button: data.meetingLink
      ? { text: "Join Session", url: data.meetingLink }
      : undefined,
    outro: "We look forward to seeing you!",
    branding,
  });

  const text = buildEmailText([
    "Appointment Reminder",
    `Dear ${data.clientName},`,
    "Reminder about your upcoming appointment:",
    `Professional: ${professionalName}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    data.meetingLink ? `Join: ${data.meetingLink}` : "",
  ]);

  const subject = await getSubject(
    "appointment_reminder",
    "Appointment Reminder - JeChemine",
  );

  return sendEmail(
    { to: data.clientEmail, subject, html, text },
    "appointment_reminder",
  );
}

export async function sendMeetingLinkNotification(
  data: MeetingLinkEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const professionalName = formatProfessionalName(data.professionalName);
  const appointmentType = formatAppointmentType(data.type);

  const html = buildEmailHtml({
    title: "Meeting Link Ready",
    subtitle: "Your Session Details",
    theme: "success",
    badge: { text: "🔗 Link Ready", theme: "success" },
    greeting: `Dear ${data.guestName},`,
    intro:
      "Your meeting link is now ready. You can join the session using the link below.",
    details: [
      { label: "Professional", value: professionalName },
      { label: "Type", value: appointmentType },
      { label: "Date", value: formattedDate },
      { label: "Time", value: formattedTime },
      { label: "Duration", value: `${data.duration} minutes` },
      { label: "Meeting Link", value: data.meetingLink, isLink: true },
    ],
    detailsBorderColor: "#22c55e",
    button: { text: "Join Session", url: data.meetingLink },
    outro:
      "Please join the session a few minutes early and ensure you have a stable internet connection.",
    branding,
  });

  const text = buildEmailText([
    "Your Meeting Link is Ready",
    `Dear ${data.guestName},`,
    "Your session details:",
    `Professional: ${professionalName}`,
    `Type: ${appointmentType}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    `Duration: ${data.duration} minutes`,
    `Meeting Link: ${data.meetingLink}`,
  ]);

  const subject = await getSubject(
    "meeting_link",
    "Your Meeting Link is Ready - JeChemine",
  );

  return sendEmail(
    { to: data.guestEmail, subject, html, text },
    "meeting_link",
  );
}

export async function sendCancellationNotification(
  data: AppointmentEmailData & { cancelledBy: "client" | "professional" },
): Promise<boolean> {
  const branding = await getBranding();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const isClientCancellation = data.cancelledBy === "client";
  const recipientEmail = isClientCancellation
    ? data.professionalEmail
    : data.clientEmail;
  const recipientName = isClientCancellation
    ? formatProfessionalName(data.professionalName)
    : data.clientName;
  const cancellerName = isClientCancellation
    ? data.clientName
    : formatProfessionalName(data.professionalName);

  const hasSchedule = data.date && data.time;
  const intro = hasSchedule
    ? `The appointment scheduled for ${formattedDate} at ${formattedTime} has been cancelled by ${cancellerName}.`
    : `An appointment request has been cancelled by ${cancellerName}.`;

  const html = buildEmailHtml({
    title: "Appointment Cancelled",
    theme: "danger",
    greeting: `Dear ${recipientName},`,
    intro,
    details: hasSchedule
      ? [
          { label: "Original Date", value: formattedDate },
          { label: "Original Time", value: formattedTime },
          { label: "Cancelled By", value: cancellerName },
        ]
      : undefined,
    detailsBorderColor: "#ef4444",
    outro:
      "If you have any questions or would like to reschedule, please contact us.",
    branding,
  });

  const text = buildEmailText([
    "Appointment Cancelled",
    `Dear ${recipientName},`,
    intro,
    hasSchedule ? `Original Date: ${formattedDate}` : "",
    hasSchedule ? `Original Time: ${formattedTime}` : "",
  ]);

  const subject = await getSubject(
    "appointment_cancellation",
    `Appointment Cancelled${isClientCancellation ? " by Client" : ""} - JeChemine`,
  );

  return sendEmail(
    { to: recipientEmail, subject, html, text },
    "appointment_cancellation",
  );
}

// =============================================================================
// Public Email Functions - Payments
// =============================================================================

export async function sendPaymentFailedNotification(
  data: PaymentEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const currency = await getCurrency();
  const paymentUrl = `${process.env.NEXTAUTH_URL}/payment`;

  const html = buildEmailHtml({
    title: "Payment Failed",
    subtitle: "Action Required",
    theme: "danger",
    greeting: `Dear ${data.name},`,
    intro:
      "Unfortunately, we were unable to process your payment. Please update your payment method and try again.",
    details: data.appointmentDate
      ? [
          { label: "Amount", value: `$${data.amount.toFixed(2)} ${currency}` },
          {
            label: "Appointment Date",
            value: formatEmailDate(data.appointmentDate),
          },
          {
            label: "Professional",
            value: formatProfessionalName(data.professionalName),
          },
        ]
      : [{ label: "Amount", value: `$${data.amount.toFixed(2)} ${currency}` }],
    button: { text: "Retry Payment", url: paymentUrl },
    infoBox: {
      title: "Need Help?",
      content:
        "If you continue to experience issues, please contact our support team for assistance.",
      theme: "info",
    },
    outro: "Please resolve this within 24 hours to keep your appointment slot.",
    branding,
  });

  const text = buildEmailText([
    "Payment Failed - Action Required",
    `Dear ${data.name},`,
    "Your payment could not be processed.",
    `Amount: $${data.amount.toFixed(2)} ${currency}`,
    `Retry payment: ${paymentUrl}`,
  ]);

  const subject = await getSubject(
    "payment_failed",
    "Payment Failed - Action Required",
  );

  return sendEmail({ to: data.email, subject, html, text }, "payment_failed");
}

export async function sendRefundConfirmation(
  data: PaymentEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const currency = await getCurrency();

  const html = buildEmailHtml({
    title: "Refund Processed",
    theme: "info",
    greeting: `Dear ${data.name},`,
    intro:
      "Your refund has been successfully processed. The funds should appear in your account within 5-10 business days.",
    details: [
      { label: "Refund Amount", value: `$${data.amount.toFixed(2)} ${currency}` },
      ...(data.appointmentDate
        ? [
            {
              label: "Original Appointment",
              value: formatEmailDate(data.appointmentDate),
            },
          ]
        : []),
    ],
    infoBox: {
      title: "Processing Time",
      content:
        "Refunds typically take 5-10 business days to appear on your statement, depending on your bank.",
    },
    outro:
      "If you have any questions about this refund, please contact our support team.",
    branding,
  });

  const text = buildEmailText([
    "Refund Processed",
    `Dear ${data.name},`,
    "Your refund has been processed.",
    `Amount: $${data.amount.toFixed(2)} ${currency}`,
    "Funds should appear in your account within 5-10 business days.",
  ]);

  const subject = await getSubject(
    "payment_refund",
    "Refund Processed - JeChemine",
  );

  return sendEmail({ to: data.email, subject, html, text }, "payment_refund");
}

// =============================================================================
// Public Email Functions - Professional Status
// =============================================================================

export async function sendProfessionalApprovalEmail(
  data: ProfessionalStatusEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/professional/dashboard`;

  const html = buildEmailHtml({
    title: "Application Approved!",
    subtitle: "Welcome to the Team",
    theme: "success",
    badge: { text: "✅ Approved", theme: "success" },
    greeting: `Dear ${data.name},`,
    intro:
      "Congratulations! Your professional application has been approved. You can now start accepting appointments and connecting with clients.",
    infoBox: {
      title: "Getting Started",
      content:
        "Complete your profile, set your availability, and start accepting appointment requests from clients who need your expertise.",
    },
    button: { text: "Go to Dashboard", url: dashboardUrl },
    outro: "Thank you for joining us. We're excited to have you on board!",
    branding,
  });

  const text = buildEmailText([
    "Application Approved!",
    `Dear ${data.name},`,
    "Your professional application has been approved.",
    "You can now start accepting appointments.",
    `Go to your dashboard: ${dashboardUrl}`,
  ]);

  const subject = await getSubject(
    "professional_approval",
    "Welcome! Your Professional Account is Approved",
  );

  return sendEmail(
    { to: data.email, subject, html, text },
    "professional_approval",
  );
}

export async function sendProfessionalRejectionEmail(
  data: ProfessionalStatusEmailData,
): Promise<boolean> {
  const branding = await getBranding();

  const html = buildEmailHtml({
    title: "Application Update",
    theme: "info",
    greeting: `Dear ${data.name},`,
    intro:
      "Thank you for your interest in joining our platform. After careful review, we're unable to approve your application at this time.",
    infoBox: data.reason
      ? {
          title: "Feedback",
          content: data.reason,
        }
      : undefined,
    outro:
      "If you believe this decision was made in error or would like to provide additional information, please contact our support team.",
    branding,
  });

  const text = buildEmailText([
    "Application Update",
    `Dear ${data.name},`,
    "We're unable to approve your application at this time.",
    data.reason ? `Feedback: ${data.reason}` : "",
    "Please contact support if you have questions.",
  ]);

  const subject = await getSubject(
    "professional_rejection",
    "Application Update - JeChemine",
  );

  return sendEmail(
    { to: data.email, subject, html, text },
    "professional_rejection",
  );
}

/** Alerte admins : un client a choisi Interac / virement (entente de confiance à valider). */
export async function sendAdminInteracTrustRequestAlert(data: {
  clientName: string;
  clientEmail: string;
  appointmentId: string;
}): Promise<void> {
  await connectToDatabase();
  const adminUsers = await User.find({ isAdmin: true, role: "admin" })
    .select("email")
    .lean();
  let emails = adminUsers
    .map((a) => a.email)
    .filter((e): e is string => Boolean(e));
  if (emails.length === 0 && process.env.ADMIN_ALERT_EMAIL) {
    emails = process.env.ADMIN_ALERT_EMAIL.split(",").map((s) => s.trim());
  }
  if (emails.length === 0) {
    console.warn(
      "[admin_interac_trust_request] No admin emails — set ADMIN_ALERT_EMAIL or admin users.",
    );
    return;
  }

  const base =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  const reviewUrl = `${base}/admin/dashboard/payment-trust`;

  const branding = await getBranding();
  const html = buildEmailHtml({
    title: "Validation garantie Interac / virement",
    theme: "warning",
    greeting: "Bonjour,",
    intro:
      "Un client a indiqué ne pas utiliser de carte et souhaite payer par virement Interac (entente de confiance). Validez le profil pour passer le client en Statut vert.",
    details: [
      { label: "Client", value: data.clientName },
      { label: "Courriel", value: data.clientEmail },
      { label: "Rendez-vous", value: data.appointmentId },
    ],
    button: { text: "Ouvrir la file d’attente", url: reviewUrl },
    outro:
      "Après chaque séance, le paiement doit être reçu dans les 24 heures. Merci de confirmer la réception selon vos processus internes.",
    branding,
  });

  const text = buildEmailText([
    "Interac / virement — action admin requise",
    `Client: ${data.clientName} (${data.clientEmail})`,
    `Rendez-vous: ${data.appointmentId}`,
    `Valider: ${reviewUrl}`,
  ]);

  const subject = await getSubject(
    "admin_interac_trust_request",
    "Interac / virement — validation requise (Statut vert)",
  );

  for (const to of emails) {
    await sendEmail({ to, subject, html, text }, "admin_interac_trust_request");
  }
}

export async function sendInteracTransferInstructionsEmail(data: {
  clientName: string;
  clientEmail: string;
  clientLegalName: string;
  depositEmail: string;
  amountCad: number;
  interacReferenceCode: string;
  professionalName: string;
  appointmentDateLabel: string;
}): Promise<boolean> {
  const branding = await getBranding();
  const company = branding?.companyName || "JeChemine";

  const smsBlock = [
    "Paiement Interac Rapide ⚡",
    `📧 Courriel : ${data.depositEmail}`,
    `💰 Montant : ${data.amountCad.toFixed(2)} $`,
    `📝 Message obligatoire : ${data.interacReferenceCode}`,
    "",
    "Le système pourra associer votre virement à votre dossier grâce à ce code.",
  ].join("\n");

  const html = buildEmailHtml({
    title: "Instructions — virement Interac",
    theme: "info",
    greeting: `Bonjour ${data.clientName},`,
    intro: `Voici comment envoyer votre virement pour votre séance avec ${data.professionalName} (${data.appointmentDateLabel}).`,
    details: [
      {
        label: "1. Envoyez votre virement à",
        value: data.depositEmail,
      },
      {
        label: "2. Vérification du nom",
        value: `Le nom associé à votre compte bancaire doit être identique à celui de votre dossier : ${data.clientLegalName}.`,
      },
      {
        label: "3. Compte d’un tiers ou d’une entreprise",
        value:
          "Inscrivez votre nom complet dans le champ « Message » du virement pour que nous puissions identifier votre paiement.",
      },
      {
        label: "4. Message obligatoire (référence unique)",
        value: data.interacReferenceCode,
      },
    ],
    infoBox: {
      title: "Format court (idéal mobile / SMS)",
      content: smsBlock.split("\n").join("<br/>"),
      theme: "info",
    },
    outro: `PAD et carte : vous pouvez aussi enregistrer un moyen de paiement sécurisé (Stripe) depuis votre espace Facturation. Pour les PME, des solutions type prélèvement avec mandat (ex. intégrations bancaires spécialisées) peuvent s’ajouter — contactez ${company} pour plus d’informations.`,
    branding,
  });

  const text = buildEmailText([
    "Instructions virement Interac",
    `Bonjour ${data.clientName},`,
    `Séance avec ${data.professionalName} — ${data.appointmentDateLabel}`,
    "",
    `1. Envoyer le virement à : ${data.depositEmail}`,
    `2. Nom : doit correspondre à « ${data.clientLegalName} »`,
    "3. Tiers / entreprise : indiquez votre nom complet dans le message du virement.",
    `4. Message obligatoire : ${data.interacReferenceCode}`,
    `Montant : ${data.amountCad.toFixed(2)} $`,
    "",
    "— Format SMS —",
    smsBlock,
  ]);

  const subject = await getSubject(
    "interac_transfer_instructions",
    "Instructions virement Interac — JeChemine",
  );

  return sendEmail(
    { to: data.clientEmail, subject, html, text },
    "interac_transfer_instructions",
  );
}

export async function sendFiscalReceiptEmail(data: {
  clientEmail: string;
  clientName: string;
  amountCad: number;
  pdfBuffer: Buffer;
  appointmentId: string;
  paymentPendingTransfer: boolean;
}): Promise<boolean> {
  const branding = await getBranding();
  const subject = await getSubject(
    "fiscal_receipt",
    "Votre reçu fiscal — JeChemine",
  );
  const html = buildEmailHtml({
    title: "Reçu fiscal",
    theme: data.paymentPendingTransfer ? "warning" : "success",
    greeting: `Bonjour ${data.clientName},`,
    intro: data.paymentPendingTransfer
      ? `Votre séance est enregistrée. Montant dû : ${data.amountCad.toFixed(2)} $ CAD (virement Interac). Les instructions ont été ou seront envoyées par courriel. Vous trouverez en pièce jointe votre reçu.`
      : `Votre paiement de ${data.amountCad.toFixed(2)} $ CAD a été traité. Veuillez trouver votre reçu fiscal en pièce jointe.`,
    branding,
  });
  const text = buildEmailText([
    "Reçu fiscal — Je Chemine",
    data.paymentPendingTransfer
      ? `Montant dû (Interac) : ${data.amountCad.toFixed(2)} $ CAD`
      : `Paiement reçu : ${data.amountCad.toFixed(2)} $ CAD`,
    "PDF en pièce jointe.",
  ]);
  return sendEmail(
    {
      to: data.clientEmail,
      subject,
      html,
      text,
      attachments: [
        {
          filename: `recu-${data.appointmentId.slice(-8)}.pdf`,
          content: data.pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    },
    "fiscal_receipt",
  );
}

export async function sendPaymentGuaranteeDay1Reminder(data: {
  clientName: string;
  clientEmail: string;
  billingUrl: string;
}): Promise<boolean> {
  const branding = await getBranding();
  const html = buildEmailHtml({
    title: "Rappel : moyen de paiement",
    theme: "warning",
    greeting: `Bonjour ${data.clientName},`,
    intro:
      "Votre rendez-vous est confirmé, mais aucune carte ni prélèvement bancaire (PAD) n’est encore enregistré. Ajoutez un moyen de paiement pour finaliser la garantie.",
    button: { text: "Ouvrir Facturation", url: data.billingUrl },
    outro: "Si vous avez choisi le virement Interac, votre demande est en traitement côté administration.",
    branding,
  });
  const text = buildEmailText([
    "Rappel moyen de paiement",
    `Bonjour ${data.clientName},`,
    "Ajoutez une carte ou un PAD :",
    data.billingUrl,
  ]);
  const subject = await getSubject(
    "payment_guarantee_day1_reminder",
    "Rappel : ajoutez un moyen de paiement — JeChemine",
  );
  return sendEmail(
    { to: data.clientEmail, subject, html, text },
    "payment_guarantee_day1_reminder",
  );
}

export async function sendPaymentGuarantee48hClientReminder(data: {
  clientName: string;
  clientEmail: string;
  billingUrl: string;
  appointmentDateLabel: string;
}): Promise<boolean> {
  const branding = await getBranding();
  const html = buildEmailHtml({
    title: "URGENT — rendez-vous proche",
    theme: "danger",
    greeting: `Bonjour ${data.clientName},`,
    intro: `Votre rendez-vous du ${data.appointmentDateLabel} approche. Aucune garantie de paiement (carte/PAD) n’est en place. Merci d’agir immédiatement pour éviter tout report.`,
    button: { text: "Ajouter un moyen de paiement", url: data.billingUrl },
    branding,
  });
  const text = buildEmailText([
    "URGENT — moyen de paiement",
    `Bonjour ${data.clientName},`,
    `Rendez-vous : ${data.appointmentDateLabel}`,
    data.billingUrl,
  ]);
  const subject = await getSubject(
    "payment_guarantee_48h_client",
    "URGENT : moyen de paiement — JeChemine",
  );
  return sendEmail(
    { to: data.clientEmail, subject, html, text },
    "payment_guarantee_48h_client",
  );
}

export async function sendPaymentGuarantee48hProfessionalAlert(data: {
  professionalEmail: string;
  professionalName: string;
  clientName: string;
  appointmentDateLabel: string;
  appointmentId: string;
}): Promise<boolean> {
  const branding = await getBranding();
  const base =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  const dashboardUrl = `${base}/professional/dashboard/sessions`;

  const html = buildEmailHtml({
    title: "ALERTE — client sans garantie de paiement",
    theme: "danger",
    greeting: `Bonjour ${data.professionalName},`,
    intro: `Le client ${data.clientName} n’a toujours pas de carte ni prélèvement enregistré pour le rendez-vous du ${data.appointmentDateLabel}. Dernière relance automatique envoyée au client.`,
    details: [
      { label: "Rendez-vous", value: data.appointmentId },
    ],
    button: { text: "Voir les séances", url: dashboardUrl },
    branding,
  });
  const text = buildEmailText([
    "ALERTE garantie paiement",
    `Bonjour ${data.professionalName},`,
    `Client : ${data.clientName}`,
    `Date : ${data.appointmentDateLabel}`,
    dashboardUrl,
  ]);
  const subject = await getSubject(
    "payment_guarantee_48h_professional",
    "ALERTE : client sans garantie — rendez-vous proche",
  );
  return sendEmail(
    { to: data.professionalEmail, subject, html, text },
    "payment_guarantee_48h_professional",
  );
}

export async function sendResendInvitationEmail(data: {
  name: string;
  email: string;
  role: "client" | "professional";
  locale?: "fr" | "en";
}): Promise<boolean> {
  const branding = await getBranding();
  const lang = data.locale || "fr";
  const loginUrl = "https://cheminement.vercel.app/login";

  const titles = {
    fr: "Finalisez votre inscription",
    en: "Finalize your registration",
  };
  const greetings = {
    fr: `Bonjour ${data.name},`,
    en: `Hello ${data.name},`,
  };
  const intros = {
    fr: `Vous avez été invité à rejoindre ${branding?.companyName || "JeChemine"}. Veuillez vous connecter pour compléter votre profil et accéder à votre tableau de bord.`,
    en: `You have been invited to join ${branding?.companyName || "JeChemine"}. Please log in to complete your profile and access your dashboard.`,
  };
  const buttons = {
    fr: "Se connecter au site",
    en: "Log in to the site",
  };
  const outros = {
    fr: "Si vous avez des questions, n'hésitez pas à nous contacter.",
    en: "If you have any questions, feel free to contact us.",
  };

  const html = buildEmailHtml({
    title: titles[lang],
    subtitle: branding?.companyName || "JeChemine",
    theme: "info",
    greeting: greetings[lang],
    intro: intros[lang],
    button: { text: buttons[lang], url: loginUrl },
    outro: outros[lang],
    branding,
  });

  const text = buildEmailText([
    titles[lang],
    branding?.companyName || "JeChemine",
    greetings[lang],
    intros[lang],
    `${buttons[lang]}: ${loginUrl}`,
    outros[lang],
  ]);

  const subject =
    lang === "fr"
      ? `Invitation à rejoindre ${branding?.companyName || "JeChemine"}`
      : `Invitation to join ${branding?.companyName || "JeChemine"}`;

  return sendEmail({ to: data.email, subject, html, text }, "welcome");
}
