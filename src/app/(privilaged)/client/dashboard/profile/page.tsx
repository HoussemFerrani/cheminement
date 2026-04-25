"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { medicalProfileAPI } from "@/lib/api-client";
import { CheckCircle2 } from "lucide-react";
import BasicInformation from "@/components/dashboard/BasicInformation";
import MedicalProfile from "@/components/dashboard/MedicalProfile";
import { IMedicalProfile } from "@/models/MedicalProfile";

export default function ClientProfilePage() {
  const [profile, setProfile] = useState<IMedicalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations("Client.profile");

  const fetchProfile = async () => {
    try {
      const profileData = await medicalProfileAPI.get();
      if (profileData) {
        setProfile(profileData as IMedicalProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground font-light">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-light text-foreground">
          {t("title")}
        </h1>
        <p className="text-muted-foreground font-light mt-2">{t("subtitle")}</p>
      </div>

      {/* Basic Information */}
      <BasicInformation isEditable={true} />

      {/* Platform Benefits */}
      <div className="rounded-xl bg-muted/30 p-6">
        <h3 className="font-serif font-light text-lg text-foreground mb-4">
          {t("benefits.title")}
        </h3>
        <ul className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground font-light">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{t("benefits.benefit1")}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{t("benefits.benefit2")}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{t("benefits.benefit3")}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{t("benefits.benefit4")}</span>
          </li>
        </ul>
      </div>

      <MedicalProfile
        profile={profile}
        isEditable={true}
        setProfile={setProfile}
      />
    </div>
  );
}
