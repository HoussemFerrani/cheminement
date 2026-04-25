"use client";

import { X, Calendar, Check, X as XIcon, Video } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BasicInformation from "./BasicInformation";
import MedicalProfile from "./MedicalProfile";
import { appointmentsAPI } from "@/lib/api-client";
import { useState } from "react";
import { AppointmentResponse } from "@/types/api";

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentResponse | null;
  onAction?: () => void;
}

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onAction,
}: AppointmentDetailsModalProps) {
  const [meetingLink, setMeetingLink] = useState("");
  const [showMeetingLinkInput, setShowMeetingLinkInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !appointment) return null;

  const getTypeBadge = (type: AppointmentResponse["type"] | undefined) => {
    if (!type) return null;
    const styles: Record<string, string> = {
      video: "bg-blue-100 text-blue-700",
      "in-person": "bg-green-100 text-green-700",
      phone: "bg-purple-100 text-purple-700",
      both: "bg-amber-100 text-amber-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-light ${styles[type] ?? "bg-muted text-muted-foreground"}`}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: AppointmentResponse["status"]) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-light`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "To be scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-serif">
              {appointment.clientId.firstName.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-serif font-light text-foreground">
                {appointment.clientId.firstName} {appointment.clientId.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {getTypeBadge(appointment.type)}
                {getStatusBadge(appointment.status)}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs defaultValue="appointment-details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="appointment-details">
                Appointment Details
              </TabsTrigger>
              <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
              <TabsTrigger value="medical-info">Medical Info</TabsTrigger>
            </TabsList>

            <TabsContent value="appointment-details" className="space-y-6 mt-6">
              {/* Appointment Details */}
              <div className="rounded-xl bg-card p-6 border border-border/40">
                <h3 className="text-lg font-serif font-light text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Appointment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-light mb-1">
                        Date
                      </p>
                      <p className="text-sm text-foreground font-light">
                        {formatDate(appointment.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-light mb-1">
                        Time
                      </p>
                      <p className="text-sm text-foreground font-light">
                        {appointment.time || "To be scheduled"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-light mb-1">
                        Duration
                      </p>
                      <p className="text-sm text-foreground font-light">
                        {appointment.duration} minutes
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-light mb-1">
                        Type
                      </p>
                      <p className="text-sm text-foreground font-light">
                        {appointment.type
                          ? appointment.type.charAt(0).toUpperCase() +
                            appointment.type.slice(1)
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-light mb-1">
                        Issue Type
                      </p>
                      <p className="text-sm text-foreground font-light">
                        {appointment.issueType || "N/A"}
                      </p>
                    </div>
                    {appointment.location && (
                      <div>
                        <p className="text-xs text-muted-foreground font-light mb-1">
                          Location
                        </p>
                        <p className="text-sm text-foreground font-light">
                          {appointment.location}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {appointment.notes && (
                  <div className="mt-6 pt-6 border-t border-border/40">
                    <p className="text-xs text-muted-foreground font-light mb-2">
                      Notes
                    </p>
                    <p className="text-sm text-foreground font-light leading-relaxed">
                      {appointment.notes}
                    </p>
                  </div>
                )}
                {appointment.meetingLink && (
                  <div className="mt-6 pt-6 border-t border-border/40">
                    <p className="text-xs text-muted-foreground font-light mb-2">
                      Meeting Link
                    </p>
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary font-light hover:underline"
                    >
                      {appointment.meetingLink}
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="rounded-full"
                >
                  Close
                </Button>
                {appointment.status === "pending" && (
                  <>
                    <Button
                      onClick={async () => {
                        try {
                          await appointmentsAPI.update(appointment._id, {
                            status: "cancelled",
                          });
                          onClose();
                          onAction?.();
                        } catch (error) {
                          console.error("Error denying appointment:", error);
                        }
                      }}
                      variant="destructive"
                      className="gap-2 rounded-full"
                    >
                      <XIcon className="h-4 w-4" />
                      Deny Request
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          await appointmentsAPI.update(appointment._id, {
                            status: "scheduled",
                          });
                          onClose();
                          onAction?.();
                        } catch (error) {
                          console.error("Error accepting appointment:", error);
                        }
                      }}
                      className="gap-2 rounded-full"
                    >
                      <Check className="h-4 w-4" />
                      Accept Request
                    </Button>
                  </>
                )}
                {appointment.status === "scheduled" &&
                  !appointment.meetingLink &&
                  appointment.type === "video" && (
                    <Button
                      onClick={() => setShowMeetingLinkInput(true)}
                      className="gap-2 rounded-full"
                    >
                      <Video className="h-4 w-4" />
                      Add Meeting Link
                    </Button>
                  )}
                {appointment.status === "scheduled" && (
                  <Button
                    onClick={async () => {
                      try {
                        await appointmentsAPI.update(appointment._id, {
                          status: "cancelled",
                        });
                        onClose();
                        onAction?.();
                      } catch (error) {
                        console.error("Error cancelling appointment:", error);
                      }
                    }}
                    variant="destructive"
                    className="gap-2 rounded-full"
                  >
                    <XIcon className="h-4 w-4" />
                    Cancel Appointment
                  </Button>
                )}
              </div>

              {/* Meeting Link Input Section */}
              {showMeetingLinkInput && (
                <div className="rounded-xl bg-muted/50 p-6 border border-border/40 space-y-4">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-serif font-light text-foreground">
                      Add Meeting Link
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-light">
                    Provide an external meeting link (Zoom, Google Meet,
                    Microsoft Teams, etc.)
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="meetingLink" className="text-sm font-light">
                      Meeting Link URL
                    </Label>
                    <Input
                      id="meetingLink"
                      type="url"
                      placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-defg-hij"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      className="font-light"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={() => {
                        setShowMeetingLinkInput(false);
                        setMeetingLink("");
                      }}
                      variant="outline"
                      className="rounded-full"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!meetingLink) return;

                        try {
                          setIsSubmitting(true);
                          await appointmentsAPI.update(appointment._id, {
                            status: "scheduled",
                            meetingLink: meetingLink,
                          });
                          setShowMeetingLinkInput(false);
                          setMeetingLink("");
                          onClose();
                          onAction?.();
                        } catch (error) {
                          console.error("Error accepting appointment:", error);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      className="gap-2 rounded-full"
                      disabled={!meetingLink || isSubmitting}
                    >
                      <Check className="h-4 w-4" />
                      {isSubmitting ? "Saving..." : "Confirm & Accept"}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="basic-info" className="mt-6">
              <BasicInformation
                isEditable={false}
                userId={appointment.clientId._id}
              />
            </TabsContent>

            <TabsContent value="medical-info" className="mt-6 space-y-6">
              <MedicalProfile
                isEditable={false}
                userId={appointment.clientId._id}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
