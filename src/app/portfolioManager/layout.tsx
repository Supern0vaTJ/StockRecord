import { AppLayout } from "@/components/layout/AppLayout";

export default function PortfolioManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
