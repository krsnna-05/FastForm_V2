import { Button } from "@/components/ui/button";
import { Plus, SquareStack } from "lucide-react";

const Workspace = () => {
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
          >
            <Plus className="h-4 w-4" />
            Create Form
          </Button>
        </div>

        {/* Empty State */}
        <div className="rounded-xl md:rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 md:p-12 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center gap-3 md:gap-4 text-center py-12 md:py-16">
            <div className="rounded-full bg-primary/10 p-3 md:p-4">
              <SquareStack className="h-6 md:h-8 w-6 md:w-8 text-primary" />
            </div>
            <div className="space-y-1 md:space-y-2">
              <h2 className="text-lg md:text-xl font-semibold">No forms yet</h2>
              <p className="text-xs md:text-sm text-muted-foreground max-w-sm px-2">
                Create your first form to get started.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
