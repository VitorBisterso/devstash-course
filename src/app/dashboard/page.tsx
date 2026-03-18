import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold">Welcome to DevStash</h1>
        <p className="text-muted-foreground">
          Your centralized knowledge hub for code snippets, prompts, notes, and more.
        </p>
      </div>
    </DashboardShell>
  );
}
