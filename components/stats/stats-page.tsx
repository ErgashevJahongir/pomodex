'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  ArrowLeft,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  Table as TableIcon,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTimerStore } from '@/store/timer-store';
import { createClient } from '@/lib/supabase/client';

interface DailyStats {
  date: string;
  completed_pomodoros: number;
  total_focus_time: number;
}

interface WeeklyStats {
  week_start: string;
  total_pomodoros: number;
  total_focus_time: number;
  average_daily: number;
}

interface TimerSession {
  id: string;
  user_id: string;
  mode: string;
  duration: number;
  completed_at: string;
}

export function StatsPage() {
  const t = useTranslations('stats');
  const { completedPomodoros } = useTimerStore();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [timerSessions, setTimerSessions] = useState<TimerSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    'today' | 'week' | 'month' | 'sessions'
  >('today');

  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [durationFrom, setDurationFrom] = useState('');
  const [durationTo, setDurationTo] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('all');

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      // Bugungi statistika
      const today = new Date().toISOString().split('T')[0];
      const { error: todayError } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('date', today)
        .single();

      if (todayError && todayError.code !== 'PGRST116') {
        console.error('Error fetching today stats:', todayError);
      }

      // Oxirgi 7 kunlik statistika
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: weeklyData, error: weeklyError } = await supabase
        .from('daily_stats')
        .select('*')
        .gte('date', weekAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (weeklyError) {
        console.error('Error fetching weekly stats:', weeklyError);
      }

      setDailyStats(weeklyData || []);

      // Haftalik statistika hisoblash
      const weeklyStats = calculateWeeklyStats(weeklyData || []);
      setWeeklyStats(weeklyStats);

      // Timer sessions yuklash (oxirgi 30 kun)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('timer_sessions')
        .select('*')
        .gte('completed_at', thirtyDaysAgo.toISOString())
        .order('completed_at', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching timer sessions:', sessionsError);
      } else {
        setTimerSessions(sessionsData || []);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Statistikalarni yuklash
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const calculateWeeklyStats = (dailyData: DailyStats[]): WeeklyStats[] => {
    const weeks: { [key: string]: WeeklyStats } = {};

    dailyData.forEach((day) => {
      const date = new Date(day.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Haftaning dushanbasini topish
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          week_start: weekKey,
          total_pomodoros: 0,
          total_focus_time: 0,
          average_daily: 0,
        };
      }

      weeks[weekKey].total_pomodoros += day.completed_pomodoros;
      weeks[weekKey].total_focus_time += day.total_focus_time;
    });

    // Har bir hafta uchun o'rtacha hisoblash
    Object.values(weeks).forEach((week) => {
      week.average_daily = Math.round(week.total_pomodoros / 7);
    });

    return Object.values(weeks).sort(
      (a, b) =>
        new Date(a.week_start).getTime() - new Date(b.week_start).getTime()
    );
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getModeDisplayName = (mode: string): string => {
    switch (mode) {
      case 'pomodoro':
        return 'Pomodoro';
      case 'short_break':
        return 'Qisqa Dam';
      case 'long_break':
        return 'Uzoq Dam';
      default:
        return mode;
    }
  };

  // Filter timer sessions
  const filteredSessions = timerSessions.filter((session) => {
    const sessionDate = new Date(session.completed_at);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    // Date filter
    if (fromDate && sessionDate < fromDate) return false;
    if (toDate && sessionDate > toDate) return false;

    // Duration filter
    if (durationFrom && session.duration < parseInt(durationFrom)) return false;
    if (durationTo && session.duration > parseInt(durationTo)) return false;

    // Mode filter
    if (selectedMode !== 'all' && session.mode !== selectedMode) return false;

    return true;
  });

  const applyFilters = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      let query = supabase
        .from('timer_sessions')
        .select('*')
        .order('completed_at', { ascending: false });

      // Apply date filters
      if (dateFrom) {
        query = query.gte('completed_at', new Date(dateFrom).toISOString());
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('completed_at', endDate.toISOString());
      }

      // Apply duration filters
      if (durationFrom) {
        query = query.gte('duration', parseInt(durationFrom));
      }
      if (durationTo) {
        query = query.lte('duration', parseInt(durationTo));
      }

      // Apply mode filter
      if (selectedMode !== 'all') {
        query = query.eq('mode', selectedMode);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error applying filters:', error);
      } else {
        setTimerSessions(data || []);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, durationFrom, durationTo, selectedMode]);

  if (isLoading) {
    return (
      <div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2" />
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('back')}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-8 flex gap-2">
          <Button
            variant={selectedPeriod === 'today' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('today')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            {t('today')}
          </Button>
          <Button
            variant={selectedPeriod === 'week' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('week')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {t('week')}
          </Button>
          <Button
            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('month')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            {t('month')}
          </Button>
          <Button
            variant={selectedPeriod === 'sessions' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('sessions')}
            className="flex items-center gap-2"
          >
            <TableIcon className="h-4 w-4" />
            Sessions
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Bugungi Pomodorolar */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('todayPomodoros')}
              </CardTitle>
              <Target className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedPomodoros}</div>
              <p className="text-muted-foreground text-xs">
                {t('completedToday')}
              </p>
            </CardContent>
          </Card>

          {/* Jami Focus Vaqti */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('focusTime')}
              </CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatTime(completedPomodoros * 25)}
              </div>
              <p className="text-muted-foreground text-xs">
                {t('workedToday')}
              </p>
            </CardContent>
          </Card>

          {/* Haftalik O'rtacha */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Haftalik O&apos;rtacha
              </CardTitle>
              <Activity className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weeklyStats.length > 0
                  ? Math.round(
                      weeklyStats.reduce(
                        (sum, week) => sum + week.total_pomodoros,
                        0
                      ) / weeklyStats.length
                    )
                  : 0}
              </div>
              <p className="text-muted-foreground text-xs">
                Kuniga o&apos;rtacha
              </p>
            </CardContent>
          </Card>

          {/* Jami Statistika */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami</CardTitle>
              <PieChart className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dailyStats.reduce(
                  (sum, day) => sum + day.completed_pomodoros,
                  0
                )}
              </div>
              <p className="text-muted-foreground text-xs">Oxirgi 7 kunda</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        {selectedPeriod === 'week' && (
          <Card>
            <CardHeader>
              <CardTitle>Haftalik Tafsilot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyStats.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{formatDate(day.date)}</p>
                      <p className="text-muted-foreground text-sm">
                        {formatTime(day.total_focus_time)} focus vaqti
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {day.completed_pomodoros}
                      </p>
                      <p className="text-muted-foreground text-xs">pomodoro</p>
                    </div>
                  </div>
                ))}
                {dailyStats.length === 0 && (
                  <div className="text-muted-foreground py-8 text-center">
                    <Target className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Hozircha statistika yo&apos;q</p>
                    <p className="text-sm">
                      Pomodoro&apos;larni tugallang va statistikani
                      ko&apos;ring!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedPeriod === 'today' && (
          <Card>
            <CardHeader>
              <CardTitle>Bugungi Faoliyat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <Target className="text-primary mx-auto mb-4 h-16 w-16" />
                <h3 className="mb-2 text-2xl font-bold">
                  {completedPomodoros}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Pomodoro tugallandi
                </p>
                <p className="text-muted-foreground text-sm">
                  Jami focus vaqti: {formatTime(completedPomodoros * 25)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedPeriod === 'sessions' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                Timer Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">From Date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">To Date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationFrom">Min Duration (min)</Label>
                  <Input
                    id="durationFrom"
                    type="number"
                    value={durationFrom}
                    onChange={(e) => setDurationFrom(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationTo">Max Duration (min)</Label>
                  <Input
                    id="durationTo"
                    type="number"
                    value={durationTo}
                    onChange={(e) => setDurationTo(e.target.value)}
                    placeholder="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mode">Mode</Label>
                  <Select value={selectedMode} onValueChange={setSelectedMode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="pomodoro">Pomodoro</SelectItem>
                      <SelectItem value="short_break">Short Break</SelectItem>
                      <SelectItem value="long_break">Long Break</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-4 flex gap-2">
                <Button
                  onClick={applyFilters}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                    setDurationFrom('');
                    setDurationTo('');
                    setSelectedMode('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>

              {/* Sessions Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.length > 0 ? (
                      filteredSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">
                            {formatDateTime(session.completed_at)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={(() => {
                                if (session.mode === 'pomodoro')
                                  return 'destructive';
                                if (session.mode === 'short_break')
                                  return 'default';
                                return 'secondary';
                              })()}
                            >
                              {getModeDisplayName(session.mode)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatTime(session.duration)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Download className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No sessions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              {filteredSessions.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="text-sm font-medium text-gray-500">
                      Total Sessions
                    </div>
                    <div className="text-2xl font-bold">
                      {filteredSessions.length}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="text-sm font-medium text-gray-500">
                      Pomodoros
                    </div>
                    <div className="text-2xl font-bold">
                      {
                        filteredSessions.filter((s) => s.mode === 'pomodoro')
                          .length
                      }
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="text-sm font-medium text-gray-500">
                      Total Time
                    </div>
                    <div className="text-2xl font-bold">
                      {formatTime(
                        filteredSessions.reduce((sum, s) => sum + s.duration, 0)
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
