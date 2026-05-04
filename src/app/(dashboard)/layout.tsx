import { EditorPreferencesProvider } from "@/context/editor-preferences-context";
import { getEditorPreferencesAction } from "@/lib/actions/editor-preferences";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const preferences = await getEditorPreferencesAction();

  return (
    <EditorPreferencesProvider initialPreferences={preferences}>
      {children}
    </EditorPreferencesProvider>
  );
}
