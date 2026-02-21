import { Button } from "@/components/ui/button";
import { Calendar, Plus, SquareStack } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useAuthStore from "@/store/auth.store";
import { useNavigate } from "react-router";
import { v4 as uuidV4 } from "uuid";

type FormSummary = {
  _id: string;
  title: string;
  createdAt?: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const API_ENDPOINT = "http://localhost:3000/api/form/list";
const PAGE_LIMIT = 8;

const Workspace = () => {
  const { User } = useAuthStore();
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = User?.userId || "";

  const canGoPrev = useMemo(() => page > 1, [page]);
  const canGoNext = useMemo(
    () => (pagination ? page < pagination.totalPages : false),
    [pagination, page],
  );

  useEffect(() => {
    if (!userId) {
      setForms([]);
      setPagination(null);
      return;
    }

    const controller = new AbortController();

    const loadForms = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const url = new URL(API_ENDPOINT);
        url.searchParams.set("userId", userId);
        url.searchParams.set("page", page.toString());
        url.searchParams.set("limit", PAGE_LIMIT.toString());

        const res = await fetch(url.toString(), {
          method: "GET",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(res.statusText || "Failed to load forms");
        }

        const payload = await res.json();
        setForms(payload.data || []);
        setPagination(payload.pagination || null);
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return;
        }
        console.error("Failed to load forms:", err);
        setError("Failed to load forms.");
      } finally {
        setIsLoading(false);
      }
    };

    loadForms();

    return () => controller.abort();
  }, [page, userId]);

  const handleOpenForm = (formId: string) => {
    navigate(`/workspace/form/edit?formId=${formId}&request=edit`);
  };

  const handleCreateForm = () => {
    const newFormId = uuidV4();

    navigate(`/workspace/form/edit?formId=${newFormId}&request=create`);
  };

  return (
    <div className="min-h-screen bg-background/50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 md:mb-12 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1 md:space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Your Forms
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Create and manage your forms in one place
            </p>
          </div>

          <Button
            size="lg"
            className="w-full md:w-auto gap-2 shadow-md hover:shadow-lg transition-shadow"
            onClick={handleCreateForm}
          >
            <Plus className="h-4 w-4" />
            Create Form
          </Button>
        </div>

        {/* List */}
        <div className="rounded-xl md:rounded-2xl border border-border/50 bg-linear-to-br from-card to-card/50 p-6 md:p-10 backdrop-blur-sm">
          {error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : null}

          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : forms.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 md:gap-4 text-center py-12 md:py-16">
              <div className="rounded-full bg-primary/10 p-3 md:p-4">
                <SquareStack className="h-6 md:h-8 w-6 md:w-8 text-primary" />
              </div>
              <div className="space-y-1 md:space-y-2">
                <h2 className="text-lg md:text-xl font-semibold">
                  No forms yet
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground max-w-sm px-2">
                  Create your first form to get started.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {forms.map((form) => (
                  <button
                    key={form._id}
                    type="button"
                    onClick={() => handleOpenForm(form._id)}
                    className="group rounded-xl border border-border/60 bg-background/70 p-4 text-left shadow-sm transition hover:shadow-md hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-base font-semibold">
                          {form.title || "Untitled Form"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {form.createdAt
                              ? new Date(form.createdAt).toLocaleString()
                              : "No updates yet"}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-full bg-primary/10 px-2 py-1 text-[10px] text-primary group-hover:bg-primary/20">
                        Open
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-xs text-muted-foreground">
                  Page {pagination?.page || page} of
                  {pagination?.totalPages || 1}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={!canGoPrev || isLoading}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={!canGoNext || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
