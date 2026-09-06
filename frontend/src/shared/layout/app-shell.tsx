import { ThemeToggle } from "@/platform/theme";
import { ChatPatternBackground } from "@/shared/layout/chat-pattern-background";

type AppShellProps = {
  children: React.ReactNode;
};

/**
 * Root application chrome: wallpaper + theme control + page slot.
 * Feature UI mounts as children — not inside platform packages.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <ChatPatternBackground />
      <ThemeToggle />
      <div className="relative z-0 flex min-h-full flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
