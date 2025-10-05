'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile, updateUserProfile } from '@/lib/supabase/queries';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { User, Save, ArrowLeft } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function ProfilePage() {
  const t = useTranslations('profile');
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    avatar_url: '',
  });

  const supabase = createClient();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // User authentication statusini tekshirish
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push('/login');
          return;
        }

        setUser(authUser);

        // User profile'ni olish (avtomatik yaratiladi agar mavjud bo'lmasa)
        const { data: userProfile, error } = await getUserProfile();

        if (error) {
          console.error('Error loading profile:', error);
          toast.error('Profile yuklanmadi');
        } else if (userProfile) {
          setProfile(userProfile);
          setFormData({
            username: userProfile.username,
            display_name: userProfile.display_name || '',
            avatar_url: userProfile.avatar_url || '',
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        toast.error('Profile yuklanmadi');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [router, supabase.auth]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const updates: {
        username?: string;
        display_name?: string;
        avatar_url?: string;
      } = {};

      if (formData.username !== profile.username) {
        updates.username = formData.username;
      }
      if (formData.display_name !== profile.display_name) {
        updates.display_name = formData.display_name;
      }
      if (formData.avatar_url !== profile.avatar_url) {
        updates.avatar_url = formData.avatar_url;
      }

      if (Object.keys(updates).length === 0) {
        toast.info(t('noChanges'));
        return;
      }

      const result = await updateUserProfile(updates);

      if (result.success && result.data) {
        setProfile(result.data);
        toast.success(t('profileUpdated'));
      } else {
        toast.error(result.error || t('profileUpdateFailed'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('profileUpdateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2" />
            <p className="text-muted-foreground">{t('profileLoaded')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back')}
          </Button>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('profileInfo')}
            </CardTitle>
            <CardDescription>{t('profileInfoDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.avatar_url} alt="Profile" />
                <AvatarFallback className="text-lg">
                  {getInitials(formData.display_name || user.email || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="avatar_url">{t('avatarUrl')}</Label>
                <Input
                  id="avatar_url"
                  value={formData.avatar_url}
                  onChange={(e) =>
                    handleInputChange('avatar_url', e.target.value)
                  }
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">{t('username')}</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="username"
                disabled={isSaving}
              />
              <p className="text-muted-foreground text-xs">
                {t('usernameDesc')}
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name">{t('displayName')}</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) =>
                  handleInputChange('display_name', e.target.value)
                }
                placeholder={t('displayNamePlaceholder')}
                disabled={isSaving}
              />
            </div>

            {/* User Info */}
            <div className="bg-muted rounded-lg p-4">
              <h3 className="mb-2 font-semibold">{t('accountInfo')}</h3>
              <div className="text-muted-foreground space-y-1 text-sm">
                <p>
                  <strong>{t('email')}:</strong> {user.email}
                </p>
                <p>
                  <strong>{t('username')}:</strong> @{profile?.username}
                </p>
                <p>
                  <strong>{t('registered')}:</strong>{' '}
                  {new Date(profile?.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('save')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
