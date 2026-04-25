"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Users, Stethoscope } from "lucide-react";

export default function AppointmentSelector() {
  const router = useRouter();
  const t = useTranslations("AppointmentSelector");

  // Order: 1. For me (Individual), 2. For a loved one, 3. For a patient
  const options = [
    {
      id: "individual",
      icon: User,
      title: t("individual.title"),
      description: t("individual.description"),
      route: "/appointment?for=self",
    },
    {
      id: "relative",
      icon: Users,
      title: t("relative.title"),
      description: t("relative.description"),
      route: "/appointment?for=loved-one",
    },
    {
      id: "patient",
      icon: Stethoscope,
      title: t("patient.title"),
      description: t("patient.description"),
      route: "/appointment?for=patient",
    },
  ];

  const handleSelect = (route: string) => {
    router.push(route);
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((option) => {
            const IconComponent = option.icon;
            return (
              <Card
                key={option.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer border border-border group"
                onClick={() => handleSelect(option.route)}
              >
                <div className="h-full flex flex-col items-center justify-between text-center gap-4">
                  {/* Icon */}
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="font-medium text-base md:text-lg text-foreground mb-2">
                      {option.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>

                  {/* Button */}
                  <Button
                    variant="default"
                    className="w-full mt-auto group-hover:bg-primary/90 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option.route);
                    }}
                  >
                    {t("selectButton")} {/* "Prendre rendez-vous" */}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
