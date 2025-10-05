import { createClient as createBrowserClient } from '@/lib/supabase/client';
import type { TimerModeDB } from '@/lib/supabase/types';

export interface User {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Timer Sessions Queries
 */

// Timer sessiyasini saqlash
export async function saveTimerSession(
  mode: TimerModeDB,
  duration: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Timer session saqlash
    const { error } = await supabase.from('timer_sessions').insert({
      user_id: user.id,
      mode,
      duration,
    });

    if (error) {
      console.error('Error saving timer session:', error);
      return { success: false, error: error.message };
    }

    // Agar pomodoro tugagan bo'lsa, daily stats yangilash
    if (mode === 'pomodoro') {
      const today = new Date().toISOString().split('T')[0];

      // Bugungi stats'ni olish
      const { data: todayStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('date', today)
        .single();

      if (todayStats) {
        // Mavjud stats'ni yangilash
        const newCompletedPomodoros = todayStats.completed_pomodoros + 1;
        const newTotalFocusTime = todayStats.total_focus_time + duration;

        await supabase
          .from('daily_stats')
          .update({
            completed_pomodoros: newCompletedPomodoros,
            total_focus_time: newTotalFocusTime,
          })
          .eq('id', todayStats.id);
      } else {
        // Yangi stats yaratish
        await supabase.from('daily_stats').insert({
          date: today,
          completed_pomodoros: 1,
          total_focus_time: duration,
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving timer session:', error);
    return { success: false, error: 'Failed to save session' };
  }
}

// User'ning timer sessiyalarini olish
export async function getTimerSessions(limit = 100) {
  try {
    const supabase = createBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('timer_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching timer sessions:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching timer sessions:', error);
    return { data: null, error: 'Failed to fetch sessions' };
  }
}

/**
 * User Settings Queries
 */

// Default settings
const DEFAULT_SETTINGS = {
  pomodoro_duration: 25,
  short_break_duration: 5,
  long_break_duration: 15,
  auto_start_breaks: false,
  auto_start_pomodoros: false,
  long_break_interval: 4,
  notification_sound: 'boxing_bell',
  sound_volume: 70,
};

// User settings'ni olish (agar yo'q bo'lsa default settings qaytaradi)
export async function getUserSettings() {
  try {
    const supabase = createBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Agar settings topilmasa (PGRST116), default settings qaytarish
    if (error && error.code === 'PGRST116') {
      const defaultData = {
        id: '', // Empty ID indicates default settings
        user_id: user.id,
        ...DEFAULT_SETTINGS,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      return {
        data: defaultData,
        error: null,
        isDefault: true, // Flag to indicate these are default settings
      };
    }

    if (error) {
      console.error('Error fetching user settings:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null, isDefault: false };
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return { data: null, error: 'Failed to fetch settings' };
  }
}

// User settings'ni saqlash yoki yangilash
export async function saveUserSettings(settings: {
  pomodoro_duration?: number;
  short_break_duration?: number;
  long_break_duration?: number;
  auto_start_breaks?: boolean;
  auto_start_pomodoros?: boolean;
  long_break_interval?: number;
  notification_sound?: string;
  sound_volume?: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Upsert (insert yoki update)
    const { error } = await supabase.from('user_settings').upsert(
      {
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    );

    if (error) {
      console.error('Error saving user settings:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving user settings:', error);
    return { success: false, error: 'Failed to save settings' };
  }
}

/**
 * Daily Stats Queries
 */

// Bugungi statistikani olish
export async function getTodayStats() {
  try {
    const supabase = createBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching today stats:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching today stats:', error);
    return { data: null, error: 'Failed to fetch stats' };
  }
}

// Bugungi statistikani yangilash
export async function updateTodayStats(
  completedPomodoros: number,
  totalFocusTime: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('daily_stats').upsert(
      {
        user_id: user.id,
        date: today,
        completed_pomodoros: completedPomodoros,
        total_focus_time: totalFocusTime,
      },
      {
        onConflict: 'user_id,date',
      }
    );

    if (error) {
      console.error('Error updating daily stats:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating daily stats:', error);
    return { success: false, error: 'Failed to update daily stats' };
  }
}

/**
 * User Profile Queries
 */

// Unique username yaratish
function generateUniqueUsername(email: string): string {
  const baseUsername = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `${baseUsername}${randomSuffix}`;
}

// User profile yaratish (registration paytida)
export async function createUserProfile(userId: string, email: string) {
  try {
    const supabase = createBrowserClient();

    // Unique username yaratish
    let username = generateUniqueUsername(email);
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (!existingUser) {
        break; // Username mavjud emas
      }

      // Username mavjud bo'lsa, yangi random suffix qo'shamiz
      username = generateUniqueUsername(email);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return { success: false, error: 'Unable to generate unique username' };
    }

    // User profile yaratish
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        username,
        display_name: email.split('@')[0], // Email'ning birinchi qismini display name qilib
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: 'Failed to create user profile' };
  }
}

// User profile olish
export async function getUserProfile(userId?: string) {
  try {
    const supabase = createBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;

    if (!targetUserId) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single();

    // Agar profile topilmasa (PGRST116), avtomatik yaratish
    if (error && error.code === 'PGRST116') {
      console.warn('Profile not found, creating new profile...');

      // Yangi profile yaratish
      const profileResult = await createUserProfile(
        targetUserId,
        user?.email || ''
      );

      if (profileResult.success && profileResult.data) {
        return { data: profileResult.data, error: null };
      }
      return {
        data: null,
        error: profileResult.error || 'Failed to create profile',
      };
    }

    if (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error: 'Failed to fetch user profile' };
  }
}

// Username orqali user topish
export async function getUserByUsername(username: string) {
  try {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Error fetching user by username:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return { data: null, error: 'Failed to fetch user by username' };
  }
}

// User profile yangilash
export async function updateUserProfile(updates: {
  username?: string;
  display_name?: string;
  avatar_url?: string;
}) {
  try {
    const supabase = createBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Username unique'ligini tekshirish
    if (updates.username) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', updates.username)
        .neq('id', user.id)
        .single();

      if (existingUser) {
        return { success: false, error: 'Username already taken' };
      }
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: 'Failed to update user profile' };
  }
}
