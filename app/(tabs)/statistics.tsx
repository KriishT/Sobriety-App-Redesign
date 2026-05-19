import { SessionLineChart } from '@/components/SessionLineChart';
import { fetchSessionGameHistory, fetchAllSessions, HistoricalRecord, SessionSummary } from '@/lib/firestore';
import { EMPATICA_PARTICIPANT } from '@/lib/empaticaConfig';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// ─── Game + metric config ─────────────────────────────────────────────────────

interface MetricCfg {
  key: string;
  label: string;
  color: string;
  lowerBetter?: boolean;
}

interface GameCfg {
  key: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  primaryMetric: string;
  metrics: MetricCfg[];
}

const GAMES: GameCfg[] = [
  {
    key: 'dsst', name: 'DSST', icon: 'grid-outline', color: '#8B5CF6', category: 'COGNITIVE',
    primaryMetric: 'accuracy',
    metrics: [
      { key: 'score',         label: 'Score',           color: '#8B5CF6' },
      { key: 'accuracy',      label: 'Accuracy (%)',     color: '#10B981' },
      { key: 'totalAttempts', label: 'Total Attempts',   color: '#F59E0B' },
    ],
  },
  {
    key: 'stroop_naming', name: 'Stroop Naming', icon: 'text-outline', color: '#3B82F6', category: 'COGNITIVE',
    primaryMetric: 'accuracy',
    metrics: [
      { key: 'score',            label: 'Score',               color: '#3B82F6' },
      { key: 'accuracy',         label: 'Accuracy (%)',         color: '#10B981' },
      { key: 'avgReactionTimeMs',label: 'Avg Reaction (ms)',    color: '#EF4444', lowerBetter: true },
    ],
  },
  {
    key: 'typing_game', name: 'Typing Game', icon: 'rocket-outline', color: '#10B981', category: 'MOTOR',
    primaryMetric: 'wpm',
    metrics: [
      { key: 'wpm',        label: 'WPM',         color: '#10B981' },
      { key: 'accuracy',   label: 'Accuracy (%)', color: '#6366F1' },
      { key: 'efficiency', label: 'Efficiency %', color: '#F59E0B' },
    ],
  },
  {
    key: 'choice_reaction', name: 'Choice Reaction', icon: 'timer-outline', color: '#8B5CF6', category: 'COGNITIVE',
    primaryMetric: 'avgPressReactionTimeMs',
    metrics: [
      { key: 'avgPressReactionTimeMs',   label: 'Press Reaction (ms)',   color: '#8B5CF6', lowerBetter: true },
      { key: 'avgReleaseReactionTimeMs', label: 'Release Reaction (ms)', color: '#F59E0B', lowerBetter: true },
      { key: 'errors',                   label: 'Errors',                color: '#EF4444', lowerBetter: true },
    ],
  },
  {
    key: 'trail_task', name: 'Trail Task', icon: 'git-branch-outline', color: '#EC4899', category: 'COGNITIVE',
    primaryMetric: 'completionTimeSeconds',
    metrics: [
      { key: 'completionTimeSeconds', label: 'Completion Time (s)', color: '#EC4899', lowerBetter: true },
      { key: 'errorCount',            label: 'Errors',              color: '#EF4444', lowerBetter: true },
      { key: 'circlesCompleted',      label: 'Circles Completed',   color: '#10B981' },
    ],
  },
  {
    key: 'tongue_twister', name: 'Tongue Twister', icon: 'mic-outline', color: '#06B6D4', category: 'LINGUISTIC',
    primaryMetric: 'phrasesCompleted',
    metrics: [
      { key: 'phrasesCompleted', label: 'Phrases Completed',   color: '#06B6D4' },
      { key: 'correctReadings',  label: 'Correct Readings',    color: '#10B981' },
      { key: 'avgJitter',        label: 'Avg Jitter',          color: '#F59E0B' },
      { key: 'avgShimmer',       label: 'Avg Shimmer',         color: '#EF4444' },
      { key: 'avgSpeakingRate',  label: 'Speaking Rate (wps)', color: '#8B5CF6' },
    ],
  },
  {
    key: 'single_leg_stand', name: 'Single Leg Stand', icon: 'person-outline', color: '#06B6D4', category: 'BALANCE',
    primaryMetric: 'stabilityScore',
    metrics: [
      { key: 'stabilityScore', label: 'Stability Score', color: '#06B6D4' },
      { key: 'sampleCount',    label: 'Samples',         color: '#10B981' },
    ],
  },
  {
    key: 'walk_and_turn', name: 'Walk and Turn', icon: 'walk-outline', color: '#8B5CF6', category: 'GAIT',
    primaryMetric: 'stabilityScore',
    metrics: [
      { key: 'stabilityScore', label: 'Stability Score',   color: '#8B5CF6' },
      { key: 'forwardGyroAvg', label: 'Forward Gyro Avg',  color: '#F59E0B' },
      { key: 'backGyroAvg',    label: 'Back Gyro Avg',     color: '#EF4444' },
      { key: 'totalSamples',   label: 'Total Samples',     color: '#10B981' },
    ],
  },
  {
    key: 'visual_pursuit', name: 'Visual Pursuit', icon: 'eye-outline', color: '#3B82F6', category: 'OCULAR',
    primaryMetric: 'apiSuccess',
    metrics: [
      { key: 'apiSuccess', label: 'API Success (1=yes, 0=no)', color: '#3B82F6' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractValue(metrics: Record<string, any>, key: string): number | null {
  const v = metrics[key];
  if (v === null || v === undefined) return null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number' && !isNaN(v)) return v;
  return null;
}

function toChartData(records: HistoricalRecord[], metricKey: string) {
  return records
    .map((r, i) => ({ session: i + 1, value: extractValue(r.metrics, metricKey) }))
    .filter((d): d is { session: number; value: number } => d.value !== null);
}

function fmtVal(v: number | null) {
  if (v === null) return '—';
  if (Number.isInteger(v)) return String(v);
  return v < 0.1 ? v.toFixed(3) : v.toFixed(1);
}

const GAME_KEY_METRICS: Record<string, string[]> = {
  visual_pursuit:   ['apiSuccess'],
  dsst:             ['score', 'accuracy', 'totalAttempts'],
  tongue_twister:   ['phrasesCompleted', 'avgJitter', 'avgSpeakingRate'],
  choice_reaction:  ['avgPressReactionTimeMs', 'errors', 'totalRounds'],
  stroop_naming:    ['score', 'accuracy', 'totalAttempts'],
  trail_task:       ['completionTimeSeconds', 'passed', 'circlesCompleted'],
  typing_game:      ['wpm', 'accuracy', 'efficiency'],
  single_leg_stand: ['stabilityScore', 'sampleCount'],
  walk_and_turn:    ['stabilityScore', 'totalSamples', 'forwardGyroAvg'],
};

function formatMetricKey(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}
function formatMetricValue(value: any): string {
  if (value === null || value === undefined) return 'n/a';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2);
  return String(value);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Statistics() {
  const [selectedGame, setSelectedGame] = useState<GameCfg | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'graphs' | 'sessions'>('graphs');
  const [history, setHistory] = useState<Record<string, HistoricalRecord[]>>({});
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const participantId = EMPATICA_PARTICIPANT.fullId;
    Promise.all([
      ...GAMES.map(g =>
        fetchSessionGameHistory(g.key, participantId)
          .then(records => ({ key: g.key, records }))
      ),
      fetchAllSessions(participantId).then(s => ({ key: '__sessions__', sessions: s })),
    ]).then(results => {
      const map: Record<string, HistoricalRecord[]> = {};
      results.forEach(r => {
        if ('records' in r) map[r.key] = r.records;
        else setSessions((r as any).sessions);
      });
      setHistory(map);
      setLoading(false);
    });
  }, []);

  // ── Session detail view ──────────────────────────────────────────────────

  if (selectedSession) {
    const date = new Date(selectedSession.startTime);
    const dateStr = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const queue = selectedSession.gameQueue.length > 0 ? selectedSession.gameQueue : Object.keys(selectedSession.games);
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedSession(null)} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Session Results</Text>
            <Text style={styles.headerSub}>{dateStr} · {timeStr}</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>
        <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
          {queue.map(gameKey => {
            const gameCfg = GAMES.find(g => g.key === gameKey);
            const metrics = selectedSession.games[gameKey] ?? {};
            if (metrics.played === false) return null;
            const metricKeys = GAME_KEY_METRICS[gameKey] ?? [];
            return (
              <View key={gameKey} style={styles.sessionGameCard}>
                <View style={styles.sessionGameHeader}>
                  <Ionicons
                    name={(gameCfg?.icon ?? 'game-controller-outline') as any}
                    size={18}
                    color={gameCfg?.color ?? '#6366F1'}
                  />
                  <Text style={[styles.sessionGameName, { color: gameCfg?.color ?? '#6366F1' }]}>
                    {gameCfg?.name ?? gameKey}
                  </Text>
                </View>
                <View style={styles.sessionMetricsRow}>
                  {metricKeys.map(mk => (
                    <View key={mk} style={styles.sessionMetricItem}>
                      <Text style={styles.sessionMetricLabel}>{formatMetricKey(mk)}</Text>
                      <Text style={styles.sessionMetricValue}>{formatMetricValue(metrics[mk])}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Detail view (game selected) ──────────────────────────────────────────

  if (selectedGame) {
    const records = history[selectedGame.key] ?? [];
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedGame(null)} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{selectedGame.name}</Text>
            <Text style={styles.headerSub}>{records.length} session{records.length !== 1 ? 's' : ''} · full session only</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
          {records.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No data yet</Text>
              <Text style={styles.emptyBody}>Complete this game in a full session to see trends here.</Text>
            </View>
          ) : (
            selectedGame.metrics.map(m => (
              <View key={m.key} style={styles.chartCard}>
                <SessionLineChart
                  data={toChartData(records, m.key)}
                  color={m.color}
                  label={m.label}
                  lowerBetter={m.lowerBetter}
                />
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Card grid / sessions list view ──────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Statistics</Text>
          <Text style={styles.headerSub}>Full session data</Text>
        </View>
      </View>

      {/* Tab toggle */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'graphs' && styles.tabBtnActive]}
          onPress={() => setActiveTab('graphs')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'graphs' && styles.tabBtnTextActive]}>Graphs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'sessions' && styles.tabBtnActive]}
          onPress={() => setActiveTab('sessions')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'sessions' && styles.tabBtnTextActive]}>Sessions</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading session data...</Text>
        </View>
      ) : activeTab === 'sessions' ? (
        <ScrollView contentContainerStyle={styles.gridContent} showsVerticalScrollIndicator={false}>
          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No sessions yet</Text>
              <Text style={styles.emptyBody}>Complete a full session to see it here.</Text>
            </View>
          ) : (
            sessions.map((s, idx) => {
              const date = new Date(s.startTime);
              const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
              const gamesPlayed = Object.values(s.games).filter(g => g?.played !== false).length;
              return (
                <TouchableOpacity key={s.id} style={styles.gameCard} onPress={() => setSelectedSession(s)} activeOpacity={0.75}>
                  <View style={[styles.gameIconWrap, { backgroundColor: '#EEF2FF' }]}>
                    <Ionicons name="clipboard-outline" size={22} color="#6366F1" />
                  </View>
                  <View style={styles.gameCardBody}>
                    <Text style={styles.gameName}>Session {sessions.length - idx}</Text>
                    <Text style={styles.gameCategory}>{dateStr} · {timeStr}</Text>
                  </View>
                  <View style={styles.gameCardRight}>
                    <Text style={styles.gameValue}>{gamesPlayed}</Text>
                    <Text style={styles.gameSessionCount}>games</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.gridContent} showsVerticalScrollIndicator={false}>
          {GAMES.map(game => {
            const records = history[game.key] ?? [];
            const latestRecord = records[records.length - 1];
            const latestVal = latestRecord
              ? extractValue(latestRecord.metrics, game.primaryMetric)
              : null;
            const prevVal = records.length > 1
              ? extractValue(records[records.length - 2].metrics, game.primaryMetric)
              : null;
            const delta = latestVal !== null && prevVal !== null ? latestVal - prevVal : null;
            const primaryCfg = game.metrics.find(m => m.key === game.primaryMetric);
            const isGood = delta === null ? null
              : primaryCfg?.lowerBetter ? delta < 0 : delta > 0;
            const trendColor = isGood === null ? '#9CA3AF' : isGood ? '#10B981' : '#EF4444';
            const trendIcon = delta === null ? null
              : delta === 0 ? 'remove-outline'
              : delta > 0 ? 'trending-up-outline' : 'trending-down-outline';

            return (
              <TouchableOpacity
                key={game.key}
                style={styles.gameCard}
                onPress={() => setSelectedGame(game)}
                activeOpacity={0.75}
              >
                <View style={[styles.gameIconWrap, { backgroundColor: game.color + '18' }]}>
                  <Ionicons name={game.icon as any} size={26} color={game.color} />
                </View>
                <View style={styles.gameCardBody}>
                  <Text style={styles.gameName}>{game.name}</Text>
                  <Text style={styles.gameCategory}>{game.category}</Text>
                </View>
                <View style={styles.gameCardRight}>
                  <Text style={styles.gameValue}>{fmtVal(latestVal)}</Text>
                  <Text style={styles.gameSessionCount}>{records.length} sess.</Text>
                  {trendIcon && (
                    <Ionicons name={trendIcon as any} size={14} color={trendColor} />
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  headerSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6B7280' },

  // Card grid
  gridContent: { padding: 20, paddingBottom: 40 },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  gameIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameCardBody: { flex: 1 },
  gameName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  gameCategory: { fontSize: 11, color: '#9CA3AF', marginTop: 2, fontWeight: '500', textTransform: 'uppercase' },
  gameCardRight: { alignItems: 'flex-end', gap: 2 },
  gameValue: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  gameSessionCount: { fontSize: 10, color: '#9CA3AF' },

  // Detail view
  detailContent: { padding: 20, paddingBottom: 40 },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#6B7280' },
  emptyBody: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },

  // Tab toggle
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  tabBtnActive: { backgroundColor: '#6366F1' },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabBtnTextActive: { color: '#FFFFFF' },

  // Session result cards
  sessionGameCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sessionGameHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sessionGameName: { fontSize: 14, fontWeight: '700' },
  sessionMetricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sessionMetricItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    minWidth: 90,
  },
  sessionMetricLabel: { fontSize: 10, color: '#9CA3AF', marginBottom: 2, textTransform: 'uppercase' },
  sessionMetricValue: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
});

