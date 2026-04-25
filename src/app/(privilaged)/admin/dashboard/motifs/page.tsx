"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Languages,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminMotif {
  id: string;
  labelFr: string;
  labelEn: string;
  aliases: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

type FilterLocale = "all" | "missingEn";
type FilterStatus = "all" | "active" | "inactive";

export default function AdminMotifsPage() {
  const t = useTranslations("AdminDashboard.motifs");

  const [motifs, setMotifs] = useState<AdminMotif[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterLocale, setFilterLocale] = useState<FilterLocale>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMotif | null>(null);
  const [deleting, setDeleting] = useState<AdminMotif | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchMotifs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/motifs", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const body = (await res.json()) as { motifs: AdminMotif[] };
      setMotifs(body.motifs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load motifs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMotifs();
  }, [fetchMotifs]);

  const filtered = useMemo(() => {
    if (!motifs) return [];
    const q = query.trim().toLowerCase();
    return motifs.filter((m) => {
      if (filterLocale === "missingEn" && m.labelEn.trim().length > 0) {
        return false;
      }
      if (filterStatus === "active" && !m.active) return false;
      if (filterStatus === "inactive" && m.active) return false;
      if (!q) return true;
      return (
        m.labelFr.toLowerCase().includes(q) ||
        m.labelEn.toLowerCase().includes(q) ||
        m.aliases.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [motifs, query, filterLocale, filterStatus]);

  const stats = useMemo(() => {
    if (!motifs) return { total: 0, active: 0, missingEn: 0 };
    return {
      total: motifs.length,
      active: motifs.filter((m) => m.active).length,
      missingEn: motifs.filter((m) => !m.labelEn.trim()).length,
    };
  }, [motifs]);

  const openCreate = () => {
    setEditing(null);
    setMutationError(null);
    setEditorOpen(true);
  };

  const openEdit = (motif: AdminMotif) => {
    setEditing(motif);
    setMutationError(null);
    setEditorOpen(true);
  };

  const handleSubmit = async (payload: {
    labelFr: string;
    labelEn: string;
    aliases: string[];
    active: boolean;
  }) => {
    setSubmitting(true);
    setMutationError(null);
    try {
      const isEdit = !!editing;
      const res = await fetch(
        isEdit ? `/api/admin/motifs/${editing!.id}` : "/api/admin/motifs",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      setEditorOpen(false);
      setEditing(null);
      await fetchMotifs();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSubmitting(true);
    setMutationError(null);
    try {
      const res = await fetch(`/api/admin/motifs/${deleting.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      setDeleting(null);
      await fetchMotifs();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-light text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted-foreground font-light">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchMotifs}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            {t("refresh")}
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("createButton")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t("statTotal")} value={stats.total} />
        <StatCard label={t("statActive")} value={stats.active} />
        <StatCard
          label={t("statMissingEn")}
          value={stats.missingEn}
          highlight={stats.missingEn > 0}
        />
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="rounded-xl border border-border/40 bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border/40 p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-9"
            />
          </div>
          <Select
            value={filterLocale}
            onValueChange={(v) => setFilterLocale(v as FilterLocale)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filterLocaleAll")}</SelectItem>
              <SelectItem value="missingEn">
                {t("filterLocaleMissingEn")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as FilterStatus)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filterStatusAll")}</SelectItem>
              <SelectItem value="active">{t("filterStatusActive")}</SelectItem>
              <SelectItem value="inactive">
                {t("filterStatusInactive")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && !motifs ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            {t("empty")}
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {filtered.map((motif) => (
              <div
                key={motif.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-muted/30"
              >
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">
                      {motif.labelFr}
                    </span>
                    {motif.active ? (
                      <Badge
                        variant="outline"
                        className="gap-1 text-[10px] border-green-300 text-green-700"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {t("statusActive")}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 text-[10px] border-muted-foreground/40 text-muted-foreground"
                      >
                        <XCircle className="h-3 w-3" />
                        {t("statusInactive")}
                      </Badge>
                    )}
                    {!motif.labelEn.trim() ? (
                      <Badge
                        variant="outline"
                        className="gap-1 text-[10px] border-amber-400 text-amber-700"
                      >
                        <Languages className="h-3 w-3" />
                        {t("missingEnBadge")}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {motif.labelEn || (
                      <span className="italic">{t("noEnTranslation")}</span>
                    )}
                  </div>
                  {motif.aliases.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {motif.aliases.slice(0, 6).map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {a}
                        </span>
                      ))}
                      {motif.aliases.length > 6 ? (
                        <span className="text-[10px] text-muted-foreground">
                          +{motif.aliases.length - 6}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(motif)}
                    className="gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t("edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDeleting(motif);
                      setMutationError(null);
                    }}
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("delete")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MotifEditorDialog
        open={editorOpen}
        onOpenChange={(v) => {
          setEditorOpen(v);
          if (!v) setEditing(null);
        }}
        editing={editing}
        error={mutationError}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      <Dialog
        open={!!deleting}
        onOpenChange={(v) => {
          if (!v) setDeleting(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteDescription", { label: deleting?.labelFr ?? "" })}
            </DialogDescription>
          </DialogHeader>
          {mutationError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {mutationError}
            </div>
          ) : null}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleting(null)}
              disabled={submitting}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {t("confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-6 ${highlight ? "border-amber-300" : "border-border/40"}`}
    >
      <p className="text-sm font-light text-muted-foreground">{label}</p>
      <p
        className={`mt-2 text-2xl font-serif font-light ${highlight ? "text-amber-700" : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}

function MotifEditorDialog({
  open,
  onOpenChange,
  editing,
  error,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: AdminMotif | null;
  error: string | null;
  submitting: boolean;
  onSubmit: (p: {
    labelFr: string;
    labelEn: string;
    aliases: string[];
    active: boolean;
  }) => void;
}) {
  const t = useTranslations("AdminDashboard.motifs");

  const [labelFr, setLabelFr] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [aliasesText, setAliasesText] = useState("");
  const [active, setActive] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setLabelFr(editing.labelFr);
      setLabelEn(editing.labelEn);
      setAliasesText(editing.aliases.join(", "));
      setActive(editing.active);
    } else {
      setLabelFr("");
      setLabelEn("");
      setAliasesText("");
      setActive(true);
    }
    setLocalError(null);
  }, [open, editing]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const fr = labelFr.trim();
    const en = labelEn.trim();
    if (!fr) {
      setLocalError(t("errorFrRequired"));
      return;
    }
    if (!en) {
      setLocalError(t("errorEnRequired"));
      return;
    }

    const aliases = aliasesText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmit({ labelFr: fr, labelEn: en, aliases, active });
  };

  const displayedError = localError ?? error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? t("editTitle") : t("createTitle")}
          </DialogTitle>
          <DialogDescription>{t("editDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="labelFr">
              {t("labelFrField")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="labelFr"
              value={labelFr}
              onChange={(e) => setLabelFr(e.target.value)}
              placeholder={t("labelFrPlaceholder")}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="labelEn">
              {t("labelEnField")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="labelEn"
              value={labelEn}
              onChange={(e) => setLabelEn(e.target.value)}
              placeholder={t("labelEnPlaceholder")}
              required
            />
            <p className="text-xs text-muted-foreground">
              {t("labelEnHelp")}
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="aliases">{t("aliasesField")}</Label>
            <Textarea
              id="aliases"
              value={aliasesText}
              onChange={(e) => setAliasesText(e.target.value)}
              placeholder={t("aliasesPlaceholder")}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              {t("aliasesHelp")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="active" className="cursor-pointer">
              {t("activeField")}
            </Label>
          </div>

          {displayedError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {displayedError}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              {editing ? t("saveChanges") : t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
