'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

import { Box, Flex, Stack, Container } from '@/components/atomic/layout';
import { Typography } from '@/components/atomic/atoms/typography';
import { Avatar } from '@/components/atomic/atoms/avatar';
import { Button } from '@/components/atomic/atoms/button';
import { Badge } from '@/components/atomic/atoms/badge';
import { Card, CardContent } from '@/components/atomic/atoms/card';
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
      <Box
        className={cn(
          'w-full h-full xl:max-w-360 xl:h-[calc(100dvh-32px)]',
          'xl:rounded-3xl xl:shadow-[0_24px_64px_rgba(0,0,0,0.45)]',
          'border-0 xl:border border-border',
          'bg-surface/95 backdrop-blur-md',
          'flex flex-col overflow-hidden transition-all duration-300'
        )}
      >
        <Box className="h-16 px-4 sm:px-6 border-b border-border bg-surface/80 flex items-center justify-between shrink-0">
          <Flex align="center" gap={3}>
            <Flex
              align="center"
              justify="center"
              className="h-10 w-10 rounded-full bg-linear-to-b from-vami-blue to-vami-blue-active text-primary-foreground shadow-sm"
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
              <Typography variant="span" className="text-[11px] text-muted">
                Authenticated session
              </Typography>
            </Stack>
          </Flex>

          <Flex align="center" gap={2}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 text-muted-foreground hover:bg-surface-elevated rounded-full"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="h-4.5 w-4.5 text-warning" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-foreground" />
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-surface-elevated rounded-full"
              aria-label="Sign out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </Button>
          </Flex>
        </Box>

        <Box className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 no-scrollbar select-text">
          <Container size="lg" className="px-0 sm:px-4 py-2 space-y-8">
            <Card className="border-border bg-linear-to-r from-surface-elevated to-surface shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <Flex align="center" gap={4} className="min-w-0">
                  <Avatar
                    src={user?.avatarUrl}
                    fallback={displayName}
                    size="xl"
                    className="ring-4 ring-surface shadow-md shrink-0"
                  />

                  <Stack gap={1} className="min-w-0">
                    <Flex align="center" gap={2} wrap="wrap">
                      <Typography variant="h2" className="text-xl sm:text-2xl font-bold truncate">
                        {displayName}
                      </Typography>
                      {isVerified ? (
                        <Badge variant="success" className="gap-1 text-xs py-0.5 px-2">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-warning text-warning gap-1 text-xs py-0.5 px-2">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Pending Verification
                        </Badge>
                      )}
                    </Flex>

                    <Typography variant="muted" className="text-sm">
                      {displayUsername}
                    </Typography>

                    {user?.email && (
                      <Typography variant="muted" className="text-xs truncate">
                        {user.email}
                      </Typography>
                    )}
                  </Stack>
                </Flex>
              </CardContent>
            </Card>

            <Card className="border-dashed border-border bg-surface/50 text-center p-8 sm:p-12">
              <Flex direction="col" align="center" justify="center" gap={4} className="max-w-md mx-auto">
                <Stack gap={1}>
                  <Typography variant="h3" className="text-lg font-bold">
                    You are signed in
                  </Typography>
                  <Typography variant="muted" className="text-sm leading-relaxed">
                    Messaging and collaboration features are not built yet. This home
                    screen confirms your authenticated session and profile only.
                  </Typography>
                </Stack>
              </Flex>
            </Card>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
