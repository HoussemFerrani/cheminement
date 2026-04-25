"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Home,
  User,
  BookOpen,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Calendar,
  Wallet,
  Shield,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";
import { apiClient } from "@/lib/api-client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";

export function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const t = useTranslations("Dashboard.sidebar");
  const [hasManagedAccounts, setHasManagedAccounts] = useState(false);

  useEffect(() => {
    const checkManagedAccounts = async () => {
      try {
        const response = await apiClient.get<{ managedAccounts: Array<{ _id: string }> }>(
          "/users/guardian?action=managed",
        );
        setHasManagedAccounts((response.managedAccounts?.length || 0) > 0);
      } catch (err) {
        // Silently fail - user might not have managed accounts
        console.error("Error checking managed accounts:", err);
      }
    };
    checkManagedAccounts();
  }, []);

  const dashboardItems = [
    {
      title: t("overview"),
      url: "/client/dashboard",
      icon: Home,
    },
    {
      title: t("profile"),
      url: "/client/dashboard/profile",
      icon: User,
    },
    {
      title: t("schedule"),
      url: "/client/dashboard/appointments",
      icon: Calendar,
    },
    {
      title: t("billing"),
      url: "/client/dashboard/billing",
      icon: Wallet,
    },
    {
      title: t("managedAccounts"),
      url: "/client/dashboard/managed-accounts",
      icon: Shield,
    },
  ];

  const navigationItems = [
    {
      title: t("dashboard"),
      items: dashboardItems,
    },
    {
      title: t("resources"),
      items: [
        {
          title: t("library"),
          url: "/client/dashboard/library",
          icon: BookOpen,
        },
      ],
    },
    {
      title: t("support"),
      items: [
        {
          title: t("helpCenter"),
          url: "/client/dashboard/help",
          icon: HelpCircle,
        },
        {
          title: t("settings"),
          url: "/client/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarHeader className="border-b border-border/40 px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-light text-foreground"
        >
          {state === "expanded" && (
            <Image
              src="/Logo.png"
              alt={t("logo")}
              className="w-full px-8"
              width={256}
              height={32}
            />
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navigationItems.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs font-light tracking-wider text-muted-foreground/70">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="font-light transition-colors"
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {isActive && (
                            <ChevronRight className="ml-auto h-4 w-4" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async () => {
                await signOut({ redirect: false });
                router.push("/");
              }}
              className="font-light cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>{t("logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
