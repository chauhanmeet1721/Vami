'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Send,
  Search,
  Smile,
  Paperclip,
  Phone,
  MoreVertical,
  LogOut,
  Sun,
  Moon,
  CheckCheck,
  MessageSquarePlus,
  MessageCircle,
  Menu,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/atomic/templates';
import { Avatar } from '@/components/atomic/atoms/avatar';
import { Button } from '@/components/atomic/atoms/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isSent: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface ChatThread {
  id: string;
  name: string;
  avatarUrl?: string | null;
  presence: 'online' | 'busy' | 'away' | 'offline';
  lastMessage: string;
  time: string;
  unreadCount: number;
  type: 'direct' | 'group' | 'channel';
  verified?: boolean;
}

const INITIAL_THREADS: ChatThread[] = [
  {
    id: 'vami-announcements',
    name: 'Vami Announcements',
    presence: 'online',
    lastMessage: 'Welcome to Vami Chat! Experience next-gen real-time messaging.',
    time: '12:00 PM',
    unreadCount: 1,
    type: 'channel',
    verified: true,
  },
  {
    id: 'alex-morgan',
    name: 'Alex Morgan',
    presence: 'online',
    lastMessage: 'Are we still on for the design review today?',
    time: '11:42 AM',
    unreadCount: 2,
    type: 'direct',
  },
  {
    id: 'engineering-core',
    name: 'Engineering Core',
    presence: 'away',
    lastMessage: 'Production deploy v2.4.0 completed with 0 downtime.',
    time: '10:15 AM',
    unreadCount: 0,
    type: 'group',
  },
  {
    id: 'sarah-connor',
    name: 'Sarah Connor',
    presence: 'offline',
    lastMessage: 'Let me know once the API integration is complete.',
    time: 'Yesterday',
    unreadCount: 0,
    type: 'direct',
  },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'vami-announcements': [
    {
      id: 'm-1',
      senderId: 'vami',
      text: 'Welcome to Vami Chat! 🎉\n\nA state-of-the-art real-time messaging platform inspired by Telegram Web architecture.',
      timestamp: '11:58 AM',
      isSent: false,
      status: 'read',
    },
    {
      id: 'm-2',
      senderId: 'vami',
      text: 'Enjoy blazing-fast WebSockets, zero-drift layout locking, and privacy-first end-to-end sessions.',
      timestamp: '12:00 PM',
      isSent: false,
      status: 'read',
    },
  ],
  'alex-morgan': [
    {
      id: 'm-3',
      senderId: 'alex',
      text: 'Hey! Did you check out the new design tokens for Vami?',
      timestamp: '11:30 AM',
      isSent: false,
      status: 'read',
    },
    {
      id: 'm-4',
      senderId: 'me',
      text: 'Yes! The custom chat pattern and boxed container look incredible.',
      timestamp: '11:35 AM',
      isSent: true,
      status: 'read',
    },
    {
      id: 'm-5',
      senderId: 'alex',
      text: 'Are we still on for the design review today?',
      timestamp: '11:42 AM',
      isSent: false,
      status: 'read',
    },
  ],
  'engineering-core': [
    {
      id: 'm-6',
      senderId: 'eng',
      text: 'Production deploy v2.4.0 completed with 0 downtime.',
      timestamp: '10:15 AM',
      isSent: false,
      status: 'read',
    },
  ],
  'sarah-connor': [
    {
      id: 'm-7',
      senderId: 'sarah',
      text: 'Let me know once the API integration is complete.',
      timestamp: 'Yesterday',
      isSent: false,
      status: 'read',
    },
  ],
};

function ChatApplication() {
  const router = useRouter();
  const { user } = useAuth();
  const { mutateAsync: logoutUser, isPending: isLoggingOut } = useLogoutMutation();

  const [activeChatId, setActiveChatId] = React.useState<string>('vami-announcements');
  const [threads, setThreads] = React.useState<ChatThread[]>(INITIAL_THREADS);
  const [messages, setMessages] = React.useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [inputText, setInputText] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'all' | 'direct' | 'group' | 'channel'>('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(true);
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
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

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSent: true,
      status: 'delivered',
    };

    setMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));

    // Update last message in thread
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeChatId
          ? { ...t, lastMessage: inputText.trim(), time: 'Just now' }
          : t
      )
    );

    setInputText('');
  };

  const activeChat = threads.find((t) => t.id === activeChatId);
  const currentMessages = activeChatId ? messages[activeChatId] || [] : [];

  const filteredThreads = threads.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || t.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="fixed inset-0 h-screen h-[100dvh] w-screen overflow-hidden select-none bg-[#0a111a] flex items-center justify-center">
      {/* ─── Fixed Ambient Background ─────────────────────────────────────── */}
      <div
        className={cn(
          'fixed inset-0 pointer-events-none transition-colors duration-500 z-0',
          'bg-gradient-to-br from-[#e0f1bc] via-[#bfe2a7] to-[#99cf8e]',
          'dark:from-[#0e1621] dark:via-[#111c27] dark:to-[#0a111a]'
        )}
      />

      {/* ─── Boxed Desktop Container (Telegram Web Layout) ────────────────── */}
      <div
        className={cn(
          'relative z-10 w-full h-full xl:max-w-[1600px] xl:h-[calc(100dvh-28px)]',
          'xl:rounded-2xl xl:shadow-[0_24px_64px_rgba(0,0,0,0.6)]',
          'border-0 xl:border border-zinc-200/80 dark:border-[#232e3c]',
          'bg-white dark:bg-[#18222d] overflow-hidden flex'
        )}
      >
        {/* ─── BOX 1: Chats List Sidebar (Solid Surface) ─────────────────── */}
        <aside
          className={cn(
            'w-full sm:w-[380px] lg:w-[420px] shrink-0 h-full flex flex-col',
            'bg-white dark:bg-[#18222d] border-r border-[#dfe1e5] dark:border-[#232e3c]',
            'transition-all duration-300 z-20',
            !isMobileSidebarOpen && 'hidden sm:flex'
          )}
        >
          {/* Top User Bar */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-[#dfe1e5]/60 dark:border-[#232e3c]/80">
            <div className="flex items-center gap-3">
              <Avatar
                src={user?.avatarUrl}
                fallback={user?.name || 'Vami User'}
                status="online"
                size="md"
              />
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-zinc-900 dark:text-white leading-tight">
                  {user?.name || 'Vami User'}
                </span>
                <span className="text-xs text-[#707579] dark:text-[#8a9aa8]">
                  @{user?.username || 'vami_user'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 text-zinc-600 dark:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-[#242f3d]"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="h-4.5 w-4.5 text-amber-400" />
                ) : (
                  <Moon className="h-4.5 w-4.5 text-zinc-700" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="h-9 w-9 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 rounded-full hover:bg-zinc-100 dark:hover:bg-[#242f3d]"
                aria-label="Log out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>

          {/* Search Box */}
          <div className="px-3.5 pt-3 pb-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-[#707579] dark:text-[#8a9aa8]" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full h-10 pl-10 pr-4 text-sm rounded-xl transition-all outline-none',
                  'bg-zinc-100 dark:bg-[#1e2a36] text-zinc-900 dark:text-white',
                  'placeholder:text-[#707579] dark:placeholder:text-[#8a9aa8]',
                  'border border-transparent focus:border-[#3390ec] dark:focus:border-[#3390ec]'
                )}
              />
            </div>
          </div>

          {/* Folder Category Tabs */}
          <div className="px-3.5 py-1.5 flex items-center gap-1.5 border-b border-[#dfe1e5]/40 dark:border-[#232e3c]/60 overflow-x-auto no-scrollbar">
            {(['all', 'direct', 'group', 'channel'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-full capitalize transition-all whitespace-nowrap',
                  activeTab === tab
                    ? 'bg-[#3390ec] text-white shadow-sm'
                    : 'text-[#707579] dark:text-[#8a9aa8] hover:bg-zinc-100 dark:hover:bg-[#242f3d]'
                )}
              >
                {tab === 'all' ? 'All Chats' : `${tab}s`}
              </button>
            ))}
          </div>

          {/* Conversations Stream */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar divide-y divide-zinc-100/50 dark:divide-zinc-800/40">
            {filteredThreads.map((thread) => {
              const isSelected = thread.id === activeChatId;
              return (
                <div
                  key={thread.id}
                  onClick={() => {
                    setActiveChatId(thread.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={cn(
                    'p-3 flex items-center gap-3 cursor-pointer transition-colors duration-150 select-none',
                    isSelected
                      ? 'bg-[#3390ec] text-white shadow-sm'
                      : 'hover:bg-zinc-50 dark:hover:bg-[#242f3d]/60 text-zinc-900 dark:text-zinc-100'
                  )}
                >
                  <Avatar
                    src={thread.avatarUrl}
                    fallback={thread.name}
                    status={thread.presence}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn('text-sm font-semibold truncate', isSelected && 'text-white')}>
                        {thread.name}
                      </span>
                      <span
                        className={cn(
                          'text-[11px] shrink-0 ml-2',
                          isSelected ? 'text-white/80' : 'text-[#707579] dark:text-[#8a9aa8]'
                        )}
                      >
                        {thread.time}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-0.5">
                      <p
                        className={cn(
                          'text-xs truncate max-w-[220px]',
                          isSelected ? 'text-white/90' : 'text-[#707579] dark:text-[#8a9aa8]'
                        )}
                      >
                        {thread.lastMessage}
                      </p>

                      {thread.unreadCount > 0 && !isSelected && (
                        <span className="shrink-0 ml-2 h-5 min-w-5 px-1.5 rounded-full bg-[#3390ec] text-white text-[11px] font-bold flex items-center justify-center">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* New Chat FAB Button */}
          <div className="p-3 border-t border-[#dfe1e5]/50 dark:border-[#232e3c]/60 flex justify-end">
            <Button
              variant="brand"
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg hover:scale-105 active:scale-95"
              aria-label="Start new conversation"
              onClick={() => toast.info('New chat dialog coming soon')}
            >
              <MessageSquarePlus className="h-5 w-5" />
            </Button>
          </div>
        </aside>

        {/* ─── BOX 2: Active Chat Area (Signature Wallpaper Background) ──── */}
        <main
          className={cn(
            'flex-1 relative flex flex-col h-full overflow-hidden',
            isMobileSidebarOpen ? 'hidden sm:flex' : 'flex'
          )}
        >
          {/* Fixed Vector Mask Wallpaper Layer */}
          <div
            className={cn(
              'absolute inset-0 pointer-events-none transition-colors duration-500 z-0',
              'bg-[#1a3d17]/30 dark:bg-white/20'
            )}
            style={{
              maskImage: "url('/assets/wallpapers/vami-chat-pattern.svg')",
              WebkitMaskImage: "url('/assets/wallpapers/vami-chat-pattern.svg')",
              maskSize: '374px 666px',
              WebkitMaskSize: '374px 666px',
              maskRepeat: 'repeat',
              WebkitMaskRepeat: 'repeat',
              maskPosition: 'center top',
              WebkitMaskPosition: 'center top',
            }}
          />

          {activeChat ? (
            <div className="relative z-10 flex flex-col h-full">
              {/* Chat Top Header */}
              <div className="h-14 sm:h-16 px-4 bg-white/90 dark:bg-[#18222d]/90 backdrop-blur-md border-b border-[#dfe1e5] dark:border-[#232e3c] flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="sm:hidden h-9 w-9 text-zinc-600 dark:text-zinc-300"
                    aria-label="Back to chats list"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>

                  <Avatar
                    src={activeChat.avatarUrl}
                    fallback={activeChat.name}
                    status={activeChat.presence}
                    size="sm"
                  />

                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-zinc-900 dark:text-white leading-tight">
                      {activeChat.name}
                    </span>
                    <span className="text-xs text-[#707579] dark:text-[#8a9aa8] capitalize">
                      {activeChat.presence === 'online' ? 'Online' : 'Last seen recently'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#707579] dark:text-[#8a9aa8]">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 no-scrollbar">
                {/* Date Chip */}
                <div className="flex justify-center my-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-black/15 dark:bg-black/35 text-white backdrop-blur-sm shadow-sm">
                    Today
                  </span>
                </div>

                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex w-full select-text',
                      msg.isSent ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-md transition-all',
                        msg.isSent
                          ? 'bg-[#3390ec] text-white rounded-br-xs'
                          : 'bg-white dark:bg-[#1e2a36] text-zinc-900 dark:text-white rounded-bl-xs border border-zinc-200/50 dark:border-[#2a3848]'
                      )}
                    >
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <div
                        className={cn(
                          'flex items-center justify-end gap-1 mt-1 text-[11px]',
                          msg.isSent ? 'text-white/80' : 'text-[#707579] dark:text-[#8a9aa8]'
                        )}
                      >
                        <span>{msg.timestamp}</span>
                        {msg.isSent && (
                          <CheckCheck className="h-3.5 w-3.5 stroke-[2.5] text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Message Composer */}
              <div className="p-3 sm:p-4 bg-white/90 dark:bg-[#18222d]/90 backdrop-blur-md border-t border-[#dfe1e5] dark:border-[#232e3c]">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-[#707579] hover:text-[#3390ec] dark:text-[#8a9aa8] dark:hover:text-[#3390ec] shrink-0"
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>

                  <div className="relative flex-1 flex items-center">
                    <input
                      type="text"
                      placeholder="Write a message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className={cn(
                        'w-full h-11 sm:h-12 pl-4 pr-10 text-[15px] rounded-2xl outline-none transition-all',
                        'bg-zinc-100 dark:bg-[#1e2a36] text-zinc-900 dark:text-white',
                        'placeholder:text-[#707579] dark:placeholder:text-[#8a9aa8]',
                        'border border-transparent focus:border-[#3390ec] dark:focus:border-[#3390ec]'
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1.5 h-8 w-8 text-[#707579] hover:text-[#3390ec] dark:text-[#8a9aa8] dark:hover:text-[#3390ec]"
                      aria-label="Add emoji"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    variant="brand"
                    size="icon"
                    disabled={!inputText.trim()}
                    className={cn(
                      'h-11 w-11 sm:h-12 sm:w-12 rounded-full shrink-0 shadow-md transition-all',
                      !inputText.trim() ? 'opacity-40 scale-95' : 'hover:scale-105 active:scale-95'
                    )}
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5 -translate-x-0.5 translate-y-0.5 fill-white stroke-none" />
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            /* Empty State: No Chat Selected */
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-b from-[#3390ec] to-[#267fd9] flex items-center justify-center text-white shadow-xl shadow-[#3390ec]/25 ring-4 ring-white dark:ring-[#18222d] mb-4">
                <MessageCircle className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Select a chat to start messaging
              </h2>
              <p className="mt-1.5 text-sm text-[#707579] dark:text-[#8a9aa8] max-w-sm leading-relaxed">
                Connect with team members, participate in public channels, and share real-time updates.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute redirectTo="/login">
      <ChatApplication />
    </ProtectedRoute>
  );
}
