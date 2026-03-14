import type { ReactNode } from "react";
import NavigationShell from "@/components/layouts/navigation-shell";

export default function KnowledgeLayout({ children }: { children: ReactNode }) {
  return <NavigationShell showCommsNav={false}>{children}</NavigationShell>;
}
