import { AppHeader } from "@/components/AppHeader";

export default function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">{children}</div>
    </div>
  );
}
