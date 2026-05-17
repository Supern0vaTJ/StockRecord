import { AppLayout } from "@/components/layout/AppLayout";

export default function ReportSummarizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
