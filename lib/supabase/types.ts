/**
 * Database types
 */

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface Database {
  public: {
    Tables: {
      timer_sessions: {
        Row: {
          id: string;
          user_id: string;
          mode: TimerMode;
          duration: number; // seconds
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mode: TimerMode;
          duration: number;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mode?: TimerMode;
          duration?: number;
          completed_at?: string;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          pomodoro_duration: number;
          short_break_duration: number;
          long_break_duration: number;
          auto_start_breaks: boolean;
          auto_start_pomodoros: boolean;
          long_break_interval: number;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pomodoro_duration?: number;
          short_break_duration?: number;
          long_break_duration?: number;
          auto_start_breaks?: boolean;
          auto_start_pomodoros?: boolean;
          long_break_interval?: number;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pomodoro_duration?: number;
          short_break_duration?: number;
          long_break_duration?: number;
          auto_start_breaks?: boolean;
          auto_start_pomodoros?: boolean;
          long_break_interval?: number;
          updated_at?: string;
          created_at?: string;
        };
      };
      daily_stats: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          completed_pomodoros: number;
          total_focus_time: number; // seconds
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          completed_pomodoros?: number;
          total_focus_time?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          completed_pomodoros?: number;
          total_focus_time?: number;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          completed: boolean;
          pomodoros_count: number;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          completed?: boolean;
          pomodoros_count?: number;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          completed?: boolean;
          pomodoros_count?: number;
          order_index?: number;
          created_at?: string;
        };
      };
    };
  };
}

export type TimerSession =
  Database['public']['Tables']['timer_sessions']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type DailyStat = Database['public']['Tables']['daily_stats']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
