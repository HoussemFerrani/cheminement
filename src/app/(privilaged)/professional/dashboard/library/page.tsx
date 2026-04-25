"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Download,
  Filter,
  PlayCircle,
  Search,
  Sparkles,
  Star,
  Timer,
  Video,
  X,
  CheckCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type ResourceType = "video" | "ebook" | "guide" | "webinar";

interface Resource {
  id: number;
  title: string;
  author: string;
  type: ResourceType;
  duration?: string;
  pages?: number;
  price: string;
  rating: number;
  tags: string[];
  description: string;
  format: "PDF" | "Vidéo HD" | "Audio" | "Kit";
}

const getCategoryLabel = (
  t: (key: string) => string,
  id: ResourceType | "all",
) => {
  const labels: Record<string, string> = {
    all: t("categories.all"),
    video: t("categories.videos"),
    ebook: t("categories.ebooks"),
    webinar: t("categories.webinars"),
    guide: t("categories.guides"),
  };
  return labels[id] || id;
};

const categories: Array<{ id: ResourceType | "all"; icon: React.ElementType }> =
  [
    { id: "all", icon: Sparkles },
    { id: "video", icon: Video },
    { id: "ebook", icon: BookOpen },
    { id: "webinar", icon: PlayCircle },
    { id: "guide", icon: Filter },
  ];

const resources: Resource[] = [
  {
    id: 1,
    title: "Techniques de régulation émotionnelle en séance",
    author: "Dr. Amélie Caron, psychologue",
    type: "video",
    duration: "28 min",
    price: "29 $",
    rating: 4.8,
    tags: ["Anxiété", "Adultes", "Mindfulness"],
    description:
      "Une capsule pratique avec des démonstrations guidées pour accompagner vos clients dans la régulation émotionnelle.",
    format: "Vidéo HD",
  },
  {
    id: 2,
    title: "Guide d’intervention TDAH – Parents & écoles",
    author: "Louis-Philippe Bégin, psychoéducateur",
    type: "guide",
    pages: 42,
    price: "14 $",
    rating: 4.6,
    tags: ["TDAH", "Famille", "Scolaire"],
    description:
      "Un guide clé en main pour mieux intervenir auprès des jeunes présentant un TDAH, avec des plans d’action concrets.",
    format: "PDF",
  },
  {
    id: 3,
    title: "Webinaire — Intervention familiale systémique",
    author: "Dre Noémie Lapierre, D.Ps",
    type: "webinar",
    duration: "1 h 15",
    price: "Gratuit",
    rating: 4.9,
    tags: ["Famille", "Approche systémique", "Supervision"],
    description:
      "Un webinaire enregistré pour approfondir les outils relationnels et les interventions centrées sur la famille.",
    format: "Vidéo HD",
  },
  {
    id: 4,
    title: "Carnet d’exercices — Auto-compassion pour adolescents",
    author: "Mélanie Gagnon, psychothérapeute",
    type: "ebook",
    pages: 65,
    price: "19 $",
    rating: 4.7,
    tags: ["Adolescents", "Auto-compassion", "Pleine conscience"],
    description:
      "Un carnet illustré avec des activités, des scripts et du matériel imprimable pour vos suivis d’adolescents.",
    format: "PDF",
  },
  {
    id: 5,
    title: "Kit audio — Respiration guidée pour l’anxiété",
    author: "Alexandre Piché, psychologue",
    type: "guide",
    duration: "35 min",
    price: "12 $",
    rating: 4.5,
    tags: ["Anxiété", "Audio", "Ressources clients"],
    description:
      "Séquences audio téléchargeables pour offrir des exercices de respiration et de cohérence cardiaque à vos clients.",
    format: "Audio",
  },
  {
    id: 6,
    title: "Webinaire — Approche intégrative pour TOP",
    author: "Élise Rochefort, M.Ps",
    type: "webinar",
    duration: "52 min",
    price: "32 $",
    rating: 4.4,
    tags: ["TOP", "Enfants", "Intervention"],
    description:
      "Stratégies intégratives et outils concrets pour intervenir auprès des enfants présentant un trouble oppositionnel.",
    format: "Vidéo HD",
  },
];

export default function LibraryPage() {
  const t = useTranslations("Dashboard.library");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ResourceType | "all">(
    "all",
  );
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDownloadsModal, setShowDownloadsModal] = useState(false);
  const [downloadedIds, setDownloadedIds] = useState<number[]>([]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesCategory =
        activeCategory === "all" || resource.type === activeCategory;
      const matchesSearch =
        search.trim().length === 0 ||
        [resource.title, resource.author, resource.tags.join(" ")].some(
          (field) => field.toLowerCase().includes(search.toLowerCase()),
        );
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const handleDownload = (resource: Resource) => {
    setDownloadedIds((prev) =>
      prev.includes(resource.id) ? prev : [...prev, resource.id],
    );
    // Create a blob with resource info and trigger download
    const content = `${resource.title}\n${resource.author}\n\nType: ${resource.type}\nFormat: ${resource.format}\n\n${resource.description}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resource.title.replace(/[^a-zA-Z0-9À-ÿ ]/g, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadedResources = resources.filter((r) =>
    downloadedIds.includes(r.id),
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border/20 bg-linear-to-br from-card via-card/80 to-card/30 p-8 shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground/70">
              {t("badge")}
            </p>
            <h1 className="font-serif text-3xl font-light text-foreground lg:text-4xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Button
              onClick={() => setShowUploadModal(true)}
              className="gap-2 rounded-full px-5 py-5 text-base font-medium"
            >
              <Sparkles className="h-4 w-4" />
              {t("uploadResource")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDownloadsModal(true)}
              className="gap-2 rounded-full px-5 py-5 text-base font-medium"
            >
              <Download className="h-4 w-4" />
              {t("myDownloads")}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-border/20 bg-card/60 p-6 shadow-inner md:grid-cols-[1fr_auto] md:items-center">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-full border border-border/40 bg-card/80 py-3 pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(({ id, icon: Icon }) => {
            const isActive = activeCategory === id;
            return (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-lg"
                    : "border-border/40 bg-card/80 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {getCategoryLabel(t, id)}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-light text-foreground">
            {t("popularResources")}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredResources.length}{" "}
            {filteredResources.length > 1
              ? t("resourceCountPlural")
              : t("resourceCount")}
          </span>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {filteredResources.map((resource) => (
            <article
              key={resource.id}
              className="group relative overflow-hidden rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-linear-to-tr from-primary/12 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10 flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-muted/50 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                    {resource.type === "video" && <Video className="h-4 w-4" />}
                    {resource.type === "ebook" && (
                      <BookOpen className="h-4 w-4" />
                    )}
                    {resource.type === "guide" && (
                      <Filter className="h-4 w-4" />
                    )}
                    {resource.type === "webinar" && (
                      <PlayCircle className="h-4 w-4" />
                    )}
                    {resource.type.toUpperCase()}
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    {resource.rating.toFixed(1)}
                  </div>
                  {resource.duration && (
                    <div className="flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                      <Timer className="h-3.5 w-3.5" />
                      {resource.duration}
                    </div>
                  )}
                  {resource.pages && (
                    <div className="flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                      {resource.pages} {t("pages")}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-serif text-xl font-medium text-foreground">
                    {resource.title}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground/80">
                    {resource.author}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {resource.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/30 bg-card/90 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm font-semibold text-foreground">
                    {resource.price}
                  </div>
                  <Button
                    onClick={() => handleDownload(resource)}
                    className="gap-2 rounded-full px-4 py-4 text-sm font-medium"
                  >
                    {downloadedIds.includes(resource.id) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {t("read")}
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-dashed border-border/50 bg-card/60 px-4 py-3 text-xs text-muted-foreground">
                  <span>
                    {t("format")} : {resource.format}
                  </span>
                  <span>{t("sharedOn")}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border/40 bg-card/60 p-10 text-center text-sm text-muted-foreground">
            {t("noResults")}
          </div>
        )}
      </section>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-border/20 bg-card p-8 shadow-2xl">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="mb-2 font-serif text-2xl font-light text-foreground">
              {t("uploadTitle")}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {t("uploadDescription")}
            </p>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setShowUploadModal(false);
              }}
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {t("uploadName")}
                </label>
                <input
                  type="text"
                  placeholder={t("uploadNamePlaceholder")}
                  className="w-full rounded-xl border border-border/40 bg-card/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {t("uploadType")}
                </label>
                <select className="w-full rounded-xl border border-border/40 bg-card/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30">
                  <option value="video">Video</option>
                  <option value="ebook">eBook</option>
                  <option value="guide">Guide</option>
                  <option value="webinar">Webinar</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {t("uploadFile")}
                </label>
                <input
                  type="file"
                  className="w-full rounded-xl border border-border/40 bg-card/80 px-4 py-3 text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-1 file:text-sm file:font-medium file:text-primary"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-full px-5"
                >
                  {t("uploadCancel")}
                </Button>
                <Button type="submit" className="rounded-full px-5">
                  {t("uploadSubmit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* My Downloads Modal */}
      {showDownloadsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-border/20 bg-card p-8 shadow-2xl">
            <button
              onClick={() => setShowDownloadsModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="mb-2 font-serif text-2xl font-light text-foreground">
              {t("myDownloadsTitle")}
            </h2>
            {downloadedResources.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("myDownloadsDescription")}
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {downloadedResources.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-2xl border border-border/20 bg-card/60 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {r.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.author}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(r)}
                      className="gap-1 rounded-full text-xs"
                    >
                      <Download className="h-3 w-3" />
                      {t("read")}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDownloadsModal(false)}
                className="rounded-full px-5"
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
