import { AppLayout } from "@/components/layout/AppLayout";

export default function SendNuesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
