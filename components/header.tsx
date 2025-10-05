'use client';

import { LogOut, User, BarChart3, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { Logo } from './logo';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { getUserProfile } from '@/lib/supabase/queries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const t = useTranslations('header');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Load user profile if user exists
      if (user) {
        const { data: profile } = await getUserProfile();
        setUserProfile(profile);
      }

      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      // Load user profile if user exists
      if (session?.user) {
        const { data: profile } = await getUserProfile();
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      // Set loading to false after auth state change
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
      <div className="flex items-center gap-6">
        <Link aria-label={t('home')} href="/">
          <Logo className="h-11 w-auto text-black dark:text-white" />
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex h-9 items-center space-x-2 px-3"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={userProfile?.avatar_url || ''}
                        alt="Profile"
                      />
                      <AvatarFallback className="text-xs">
                        {userProfile?.display_name?.charAt(0) ||
                          user.email?.charAt(0) ||
                          'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm sm:inline">
                      {userProfile?.display_name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mening hisobim</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/stats" className="flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Statistika</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="h-9">
                  {tAuth('login')}
                </Button>
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}
