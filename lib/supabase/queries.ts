import { createClient as createBrowserClient } from '@/lib/supabase/client';
import type { TimerModeDB } from '@/lib/supabase/types';

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

    const { error } = await supabase.from('timer_sessions').insert({
      user_id: user.id,
      mode,
      duration,
    });

    if (error) {
      console.error('Error saving timer session:', error);
      return { success: false, error: error.message };
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
    return { success: false, error: 'Failed to update stats' };
  }
}
