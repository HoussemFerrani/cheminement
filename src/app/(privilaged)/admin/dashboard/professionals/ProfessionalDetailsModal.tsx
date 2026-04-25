"use client";

import { X } from "lucide-react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProfessionalStatus = "active" | "pending" | "inactive";

interface Professional {
  id: string;
  name: string;
  email: string;
  specialty: string;
  license: string;
  status: ProfessionalStatus;
  joinedDate: string;
  totalClients: number;
  totalSessions: number;
  userId?: string;
}

interface ProfessionalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: Professional | null;
}

const ProfessionalDetailsModal: React.FC<ProfessionalDetailsModalProps> = ({
  isOpen,
  onClose,
  professional,
}) => {
  if (!isOpen || !professional) return null;

  const getStatusBadge = (status: ProfessionalStatus) => {
    const styles = {
      active: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      inactive: "bg-gray-100 text-gray-700",
    };

    const icons = {
      active: CheckCircle2,
      pending: Clock,
      inactive: XCircle,
    };

    const Icon = icons[status];

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
      >
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/40 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-light text-foreground">
              Professional Details
            </h2>
            <p className="text-sm text-muted-foreground font-light mt-1">
              View detailed information about {professional.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="profile">Profile Details</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div>
                <h3 className="text-lg font-serif font-light text-foreground mb-4">
                  Basic Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      Name
                    </label>
                    <p className="text-foreground font-light">
                      {professional.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      Email
                    </label>
                    <p className="text-foreground font-light">
                      {professional.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      Specialty
                    </label>
                    <p className="text-foreground font-light capitalize">
                      {professional.specialty.replace("-", " ")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      License
                    </label>
                    <p className="text-foreground font-light">
                      {professional.license}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <div>
                <h3 className="text-lg font-serif font-light text-foreground mb-4">
                  Professional Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      Specialty
                    </label>
                    <p className="text-foreground font-light capitalize">
                      {professional.specialty.replace("-", " ")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      License
                    </label>
                    <p className="text-foreground font-light">
                      {professional.license}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      Status
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(professional.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      Joined Date
                    </label>
                    <p className="text-foreground font-light">
                      {new Date(professional.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-serif font-light text-foreground mb-4">
                  Professional Profile
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      Years of Experience
                    </label>
                    <p className="text-foreground font-light">N/A</p>
                  </div>
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      Bio
                    </label>
                    <p className="text-foreground font-light leading-relaxed">
                      N/A
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      Issue Types
                    </label>
                    <p className="text-foreground font-light">N/A</p>
                  </div>
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      Approaches
                    </label>
                    <p className="text-foreground font-light">N/A</p>
                  </div>
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      Age Categories
                    </label>
                    <p className="text-foreground font-light">N/A</p>
                  </div>
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      Additional Skills
                    </label>
                    <p className="text-foreground font-light">N/A</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div>
                <h3 className="text-lg font-serif font-light text-foreground mb-4">
                  Statistics
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      Total Clients
                    </label>
                    <p className="text-2xl font-serif font-light text-foreground">
                      {professional.totalClients}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-light text-muted-foreground">
                      Total Sessions
                    </label>
                    <p className="text-2xl font-serif font-light text-foreground">
                      {professional.totalSessions}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDetailsModal;
