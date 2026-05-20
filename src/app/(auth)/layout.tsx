import { Navbar } from "@/components/landing/navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center bg-background p-4 pt-20">
        {children}
      </div>
    </>
  );
}
