'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  LogOut,
  MessageSquarePlus,
  ShieldCheck,
  ShieldAlert,
  Send,
  Users,
  Lock,
  Radio,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Box, Flex, Stack, Container } from '@/components/atomic/layout';
import { Typography } from '@/components/atomic/atoms/typography';
import { Avatar } from '@/components/atomic/atoms/avatar';
import { Button } from '@/components/atomic/atoms/button';
import { Badge } from '@/components/atomic/atoms/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/atomic/atoms/card';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation';
import { cn } from '@/lib/utils';

export default function AuthenticatedHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { mutateAsync: logoutUser, isPending: isLoggingOut } = useLogoutMutation();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success('Signed out successfully');
      router.replace('/login');
    } catch {
      router.replace('/login');
    }
  };

  const displayName = user?.name || user?.username || 'Vami User';
  const displayUsername = user?.username ? `@${user.username}` : user?.email || 'user';
  const isVerified = user?.isEmailVerified;

  return (
    <Box className="relative h-full w-full flex items-center justify-center p-0 xl:p-4 select-none">
      {/* ─── Boxed Desktop Container (Telegram Web Shell) ───────────────── */}
      <Box
        className={cn(
          'w-full h-full xl:max-w-360 xl:h-[calc(100dvh-32px)]',
          'xl:rounded-3xl xl:shadow-[0_24px_64px_rgba(0,0,0,0.45)]',
          'border-0 xl:border border-vami-light-border/80 dark:border-vami-dark-border',
          'bg-white/95 dark:bg-vami-dark-surface/95 backdrop-blur-md',
          'flex flex-col overflow-hidden transition-all duration-300'
        )}
      >
        {/* ─── Top Application Bar ───────────────────────────────────────── */}
        <Box className="h-16 px-4 sm:px-6 border-b border-vami-light-border dark:border-vami-dark-border bg-white/80 dark:bg-vami-dark-surface/80 flex items-center justify-between shrink-0">
          <Flex align="center" gap={3}>
            <Flex
              align="center"
              justify="center"
              className="h-10 w-10 rounded-full bg-linear-to-b from-vami-blue to-vami-blue-active text-white shadow-sm"
            >
              <Send className="h-5 w-5 -translate-x-0.5 translate-y-0.5 fill-white stroke-none" />
            </Flex>

            <Stack gap={0}>
              <Flex align="center" gap={2}>
                <Typography variant="span" className="text-base font-bold tracking-tight">
                  Vami
                </Typography>
                <Badge variant="outline" className="text-[10px] h-5 py-0 px-2 font-medium">
                  Workspace
                </Badge>
              </Flex>
              <Typography variant="span" className="text-[11px] text-vami-muted dark:text-vami-muted-dark">
                End-to-end encrypted messaging
              </Typography>
            </Stack>
          </Flex>

          {/* User Account Controls */}
          <Flex align="center" gap={2}>
            {/* Theme Toggle Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-vami-dark-elevated rounded-full"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="h-4.5 w-4.5 text-amber-400" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-zinc-700" />
              )}
            </Button>

            {/* Logout Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="h-9 w-9 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-vami-dark-elevated rounded-full"
              aria-label="Sign out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </Button>
          </Flex>
        </Box>

        {/* ─── Main Content Workspace ────────────────────────────────────── */}
        <Box className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 no-scrollbar select-text">
          <Container size="lg" className="px-0 sm:px-4 py-2 space-y-8">
            {/* User Profile Banner Card */}
            <Card className="border-vami-light-border dark:border-vami-dark-border bg-linear-to-r from-zinc-50 to-white dark:from-vami-dark-elevated/70 dark:to-vami-dark-surface shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <Flex direction="col" gap={6} className="sm:flex-row sm:items-center sm:justify-between">
                  <Flex align="center" gap={4} className="min-w-0">
                    <Avatar
                      src={user?.avatarUrl}
                      fallback={displayName}
                      status="online"
                      size="xl"
                      className="ring-4 ring-white dark:ring-vami-dark-surface shadow-md shrink-0"
                    />

                    <Stack gap={1} className="min-w-0">
                      <Flex align="center" gap={2} wrap="wrap">
                        <Typography variant="h2" className="text-xl sm:text-2xl font-bold truncate">
                          {displayName}
                        </Typography>
                        {isVerified ? (
                          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1 text-xs py-0.5 px-2">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 gap-1 text-xs py-0.5 px-2">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Pending Verification
                          </Badge>
                        )}
                      </Flex>

                      <Typography variant="muted" className="text-sm">
                        {displayUsername}
                      </Typography>

                      {user?.email && (
                        <Typography variant="muted" className="text-xs text-vami-muted dark:text-vami-muted-dark truncate">
                          {user.email}
                        </Typography>
                      )}
                    </Stack>
                  </Flex>

                  <Button
                    variant="brand"
                    size="default"
                    onClick={() => toast.info('New conversation modal will open with WebSockets')}
                    className="sm:w-auto w-full shrink-0 shadow-md"
                  >
                    <MessageSquarePlus className="h-4 w-4 mr-1.5" />
                    New Conversation
                  </Button>
                </Flex>
              </CardContent>
            </Card>

            {/* Feature Highlights / Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="border-vami-light-border dark:border-vami-dark-border hover:border-vami-blue/50 dark:hover:border-vami-blue/50 transition-all duration-200 shadow-sm">
                <CardHeader className="p-5 pb-3">
                  <Flex align="center" justify="between">
                    <CardTitle className="text-base font-semibold">Direct Messages</CardTitle>
                    <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-vami-blue flex items-center justify-center">
                      <Lock className="h-4 w-4" />
                    </div>
                  </Flex>
                  <CardDescription className="text-xs">
                    Private 1-on-1 end-to-end encrypted chats.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <Typography variant="muted" className="text-xs">
                    Ready for real-time exchange with zero message history stored unencrypted.
                  </Typography>
                </CardContent>
              </Card>

              <Card className="border-vami-light-border dark:border-vami-dark-border hover:border-vami-blue/50 dark:hover:border-vami-blue/50 transition-all duration-200 shadow-sm">
                <CardHeader className="p-5 pb-3">
                  <Flex align="center" justify="between">
                    <CardTitle className="text-base font-semibold">Team Channels</CardTitle>
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                  </Flex>
                  <CardDescription className="text-xs">
                    Topic-based spaces for seamless team work.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <Typography variant="muted" className="text-xs">
                    Collaborate across departments with granular permissions and audit logging.
                  </Typography>
                </CardContent>
              </Card>

              <Card className="border-vami-light-border dark:border-vami-dark-border hover:border-vami-blue/50 dark:hover:border-vami-blue/50 transition-all duration-200 shadow-sm">
                <CardHeader className="p-5 pb-3">
                  <Flex align="center" justify="between">
                    <CardTitle className="text-base font-semibold">Real-Time Core</CardTitle>
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
                      <Radio className="h-4 w-4" />
                    </div>
                  </Flex>
                  <CardDescription className="text-xs">
                    Clean Architecture & modular monolith.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <Typography variant="muted" className="text-xs">
                    Sub-millisecond event dispatch with Redis pub/sub and TanStack Query state cache.
                  </Typography>
                </CardContent>
              </Card>
            </div>

            {/* Empty State: Ready for Real Chats (No Fake Mock Data) */}
            <Card className="border-dashed border-vami-light-border dark:border-vami-dark-border bg-white/50 dark:bg-vami-dark-surface/50 text-center p-8 sm:p-12">
              <Flex direction="col" align="center" justify="center" gap={4} className="max-w-md mx-auto">
                <Flex
                  align="center"
                  justify="center"
                  className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-vami-dark-elevated text-zinc-500 dark:text-zinc-400 shadow-inner"
                >
                  <Sparkles className="h-8 w-8 text-vami-blue" />
                </Flex>

                <Stack gap={1}>
                  <Typography variant="h3" className="text-lg font-bold">
                    No active conversations yet
                  </Typography>
                  <Typography variant="muted" className="text-sm leading-relaxed">
                    Your authenticated session is active and secure. Start a new conversation or invite colleagues to collaborate.
                  </Typography>
                </Stack>

                <Button
                  variant="primary"
                  onClick={() => toast.info('New chat invitation flow coming in the next module')}
                  className="mt-2"
                >
                  <MessageSquarePlus className="h-4 w-4 mr-2" />
                  Start a Conversation
                </Button>
              </Flex>
            </Card>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
