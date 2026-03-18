import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-sidebar px-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 bg-background"
            />
          </div>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New
        </Button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r bg-sidebar p-4">
          <h2>Sidebar</h2>
        </aside>
        <main className="flex-1 bg-background p-4">
          <h2>Main</h2>
        </main>
      </div>
    </div>
  );
}
