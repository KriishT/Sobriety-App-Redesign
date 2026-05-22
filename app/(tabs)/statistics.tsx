import { SessionLineChart } from '@/components/SessionLineChart';
import {
  fetchGameHistoryFull,
  fetchSessionGameHistory,
  fetchAllSessions,
  HistoricalRecord,
  SessionSummary,
} from '@/lib/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// ─── Game config ──────────────────────────────────────────────────────────────

interface MetricCfg { key: string; label: string; color: string; lowerBetter?: boolean; }
interface GameCfg   { key: string; name: string; icon: string; color: string; category: string; primaryMetric: string; metrics: MetricCfg[]; }

const GAMES: GameCfg[] = [
  { key: 'dsst', name: 'DSST', icon: 'grid-outline', color: '#8B5CF6', category: 'COGNITIVE', primaryMetric: 'accuracy',
    metrics: [{ key: 'score', label: 'Score', color: '#8B5CF6' }, { key: 'accuracy', label: 'Accuracy (%)', color: '#10B981' }, { key: 'totalAttempts', label: 'Total Attempts', color: '#F59E0B' }] },
  { key: 'stroop_naming', name: 'Stroop Naming', icon: 'text-outline', color: '#3B82F6', category: 'COGNITIVE', primaryMetric: 'accuracy',
    metrics: [{ key: 'score', label: 'Score', color: '#3B82F6' }, { key: 'accuracy', label: 'Accuracy (%)', color: '#10B981' }, { key: 'avgReactionTimeMs', label: 'Avg Reaction (ms)', color: '#EF4444', lowerBetter: true }] },
  { key: 'typing_game', name: 'Typing Game', icon: 'rocket-outline', color: '#10B981', category: 'MOTOR', primaryMetric: 'wpm',
    metrics: [{ key: 'wpm', label: 'WPM', color: '#10B981' }, { key: 'accuracy', label: 'Accuracy (%)', color: '#6366F1' }, { key: 'efficiency', label: 'Efficiency %', color: '#F59E0B' }] },
  { key: 'choice_reaction', name: 'Choice Reaction', icon: 'timer-outline', color: '#8B5CF6', category: 'COGNITIVE', primaryMetric: 'avgPressReactionTimeMs',
    metrics: [{ key: 'avgPressReactionTimeMs', label: 'Press Reaction (ms)', color: '#8B5CF6', lowerBetter: true }, { key: 'avgReleaseReactionTimeMs', label: 'Release Reaction (ms)', color: '#F59E0B', lowerBetter: true }, { key: 'errors', label: 'Errors', color: '#EF4444', lowerBetter: true }] },
  { key: 'trail_task', name: 'Trail Task', icon: 'git-branch-outline', color: '#EC4899', category: 'COGNITIVE', primaryMetric: 'completionTimeSeconds',
    metrics: [{ key: 'completionTimeSeconds', label: 'Completion Time (s)', color: '#EC4899', lowerBetter: true }, { key: 'errorCount', label: 'Errors', color: '#EF4444', lowerBetter: true }, { key: 'circlesCompleted', label: 'Circles Completed', color: '#10B981' }] },
  { key: 'tongue_twister', name: 'Tongue Twister', icon: 'mic-outline', color: '#06B6D4', category: 'LINGUISTIC', primaryMetric: 'phrasesCompleted',
    metrics: [{ key: 'phrasesCompleted', label: 'Phrases Completed', color: '#06B6D4' }, { key: 'correctReadings', label: 'Correct Readings', color: '#10B981' }, { key: 'avgJitter', label: 'Avg Jitter', color: '#F59E0B' }, { key: 'avgSpeakingRate', label: 'Speaking Rate (wps)', color: '#8B5CF6' }] },
  { key: 'single_leg_stand', name: 'Single Leg Stand', icon: 'person-outline', color: '#06B6D4', category: 'BALANCE', primaryMetric: 'stabilityScore',
    metrics: [{ key: 'stabilityScore', label: 'Stability Score', color: '#06B6D4' }, { key: 'sampleCount', label: 'Samples', color: '#10B981' }] },
  { key: 'walk_and_turn', name: 'Walk and Turn', icon: 'walk-outline', color: '#8B5CF6', category: 'GAIT', primaryMetric: 'stabilityScore',
    metrics: [{ key: 'stabilityScore', label: 'Stability Score', color: '#8B5CF6' }, { key: 'forwardGyroAvg', label: 'Forward Gyro Avg', color: '#F59E0B' }, { key: 'backGyroAvg', label: 'Back Gyro Avg', color: '#EF4444' }, { key: 'totalSamples', label: 'Total Samples', color: '#10B981' }] },
  { key: 'visual_pursuit', name: 'Visual Pursuit', icon: 'eye-outline', color: '#3B82F6', category: 'OCULAR', primaryMetric: 'vpAvgPupilPct',
    metrics: [
      { key: 'vpAvgPupilPct', label: 'Avg Pupil Detection (%)', color: '#6366F1' },
      { key: 'vpAvgIrisPct',  label: 'Avg Iris Detection (%)',  color: '#06B6D4' },
      { key: 'rounds.vertical_left.nystagmus.xNystagmusScore',    label: 'R1 HAN Score', color: '#8B5CF6', lowerBetter: true },
      { key: 'rounds.vertical_left.nystagmus.yNystagmusScore',    label: 'R1 VAN Score', color: '#A78BFA', lowerBetter: true },
      { key: 'rounds.vertical_right.nystagmus.xNystagmusScore',   label: 'R2 HAN Score', color: '#3B82F6', lowerBetter: true },
      { key: 'rounds.vertical_right.nystagmus.yNystagmusScore',   label: 'R2 VAN Score', color: '#60A5FA', lowerBetter: true },
      { key: 'rounds.horizontal_left.nystagmus.xNystagmusScore',  label: 'R3 HAN Score', color: '#10B981', lowerBetter: true },
      { key: 'rounds.horizontal_left.nystagmus.yNystagmusScore',  label: 'R3 VAN Score', color: '#34D399', lowerBetter: true },
      { key: 'rounds.horizontal_right.nystagmus.xNystagmusScore', label: 'R4 HAN Score', color: '#F59E0B', lowerBetter: true },
      { key: 'rounds.horizontal_right.nystagmus.yNystagmusScore', label: 'R4 VAN Score', color: '#FCD34D', lowerBetter: true },
    ] },
];

// ─── Session result metric keys ───────────────────────────────────────────────

const SESSION_METRIC_KEYS: Record<string, string[]> = {
  visual_pursuit:  ['apiSuccess', 'rounds.vertical_left.pupilDetected', 'rounds.vertical_right.pupilDetected', 'rounds.horizontal_left.pupilDetected', 'rounds.horizontal_right.pupilDetected'],
  dsst:            ['score', 'accuracy', 'totalAttempts'],
  tongue_twister:  ['phrasesCompleted', 'correctReadings', 'avgSpeakingRate'],
  choice_reaction: ['avgPressReactionTimeMs', 'avgReleaseReactionTimeMs', 'errors'],
  stroop_naming:   ['score', 'accuracy', 'avgReactionTimeMs'],
  trail_task:      ['completionTimeSeconds', 'passed', 'circlesCompleted', 'errorCount'],
  typing_game:     ['wpm', 'accuracy', 'efficiency'],
  single_leg_stand:['stabilityScore', 'sampleCount'],
  walk_and_turn:   ['stabilityScore', 'totalSamples'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractValue(metrics: Record<string, any>, key: string): number | null {
  if (key === 'vpAvgPupilPct') {
    const rounds = metrics?.rounds;
    if (!rounds) return null;
    const pcts = ['vertical_left','vertical_right','horizontal_left','horizontal_right']
      .map(r => { const d = rounds[r]; return d?.totalFrames ? Math.round((d.pupilDetected ?? 0) / d.totalFrames * 100) : null; })
      .filter((p): p is number => p !== null);
    return pcts.length > 0 ? Math.round(pcts.reduce((a,b)=>a+b,0)/pcts.length) : null;
  }
  if (key === 'vpAvgIrisPct') {
    const rounds = metrics?.rounds;
    if (!rounds) return null;
    const pcts = ['vertical_left','vertical_right','horizontal_left','horizontal_right']
      .map(r => { const d = rounds[r]; return d?.totalFrames ? Math.round((d.irisDetected ?? 0) / d.totalFrames * 100) : null; })
      .filter((p): p is number => p !== null);
    return pcts.length > 0 ? Math.round(pcts.reduce((a,b)=>a+b,0)/pcts.length) : null;
  }
  let v: any = metrics;
  for (const part of key.split('.')) {
    if (v == null) return null;
    v = v[part];
  }
  if (v == null) return null;
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

function fmtMetricKey(key: string) {
  return key.split('.').pop()!
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

function fmtMetricValue(value: any): string {
  if (value == null) return 'n/a';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2);
  return String(value);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Statistics() {
  const [activeTab, setActiveTab] = useState<'individual' | 'full_session'>('individual');

  // Individual: data from game_results (sessionType='individual')
  const [indHistory, setIndHistory] = useState<Record<string, HistoricalRecord[]>>({});
  // Full session: data from sessions collection
  const [sessHistory, setSessHistory] = useState<Record<string, HistoricalRecord[]>>({});
  const [sessions, setSessions]       = useState<SessionSummary[]>([]);

  const [loadingInd,  setLoadingInd]  = useState(true);
  const [loadingSess, setLoadingSess] = useState(true);

  // Navigation state
  const [selectedGame,    setSelectedGame]    = useState<GameCfg | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(null);
  // When opening a game chart from within a session, this is set
  const [sessionGameKey,  setSessionGameKey]  = useState<string | null>(null);

  // Fetch individual game history
  useEffect(() => {
    Promise.all(
      GAMES.map(g =>
        fetchGameHistoryFull(g.key, '', 'individual')
          .then(records => ({ key: g.key, records }))
      )
    ).then(results => {
      const map: Record<string, HistoricalRecord[]> = {};
      results.forEach(r => { map[r.key] = r.records; });
      setIndHistory(map);
      setLoadingInd(false);
    });
  }, []);

  // Fetch full session history
  useEffect(() => {
    Promise.all([
      ...GAMES.map(g =>
        fetchSessionGameHistory(g.key, '')
          .then(records => ({ key: g.key, records }))
      ),
      fetchAllSessions().then(s => ({ key: '__sessions__', sessions: s })),
    ]).then(results => {
      const map: Record<string, HistoricalRecord[]> = {};
      results.forEach((r: any) => {
        if ('records' in r) map[r.key] = r.records;
        else setSessions(r.sessions);
      });
      setSessHistory(map);
      setLoadingSess(false);
    });
  }, []);

  // ── Game chart view (individual) ──────────────────────────────────────────
  if (selectedGame && activeTab === 'individual') {
    const records = indHistory[selectedGame.key] ?? [];
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={s.header}>
          <TouchableOpacity onPress={() => setSelectedGame(null)} style={s.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>{selectedGame.name}</Text>
            <Text style={s.headerSub}>{records.length} individual play{records.length !== 1 ? 's' : ''}</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>
        <ScrollView contentContainerStyle={s.detailContent} showsVerticalScrollIndicator={false}>
          {records.length === 0 ? (
            <View style={s.emptyState}>
              <Ionicons name="bar-chart-outline" size={48} color="#D1D5DB" />
              <Text style={s.emptyTitle}>No individual plays yet</Text>
              <Text style={s.emptyBody}>Play this game individually to see your trend here.</Text>
            </View>
          ) : (
            selectedGame.metrics.map(m => (
              <View key={m.key} style={s.chartCard}>
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

  // ── Game chart view (from session → game drill-down) ──────────────────────
  if (sessionGameKey && selectedSession) {
    const gameCfg = GAMES.find(g => g.key === sessionGameKey);
    const records = sessHistory[sessionGameKey] ?? [];
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={s.header}>
          <TouchableOpacity onPress={() => setSessionGameKey(null)} style={s.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>{gameCfg?.name ?? sessionGameKey}</Text>
            <Text style={s.headerSub}>{records.length} full session{records.length !== 1 ? 's' : ''}</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>
        <ScrollView contentContainerStyle={s.detailContent} showsVerticalScrollIndicator={false}>
          {records.length === 0 ? (
            <View style={s.emptyState}>
              <Ionicons name="bar-chart-outline" size={48} color="#D1D5DB" />
              <Text style={s.emptyTitle}>No session data yet</Text>
              <Text style={s.emptyBody}>Complete a full session to see trends.</Text>
            </View>
          ) : (
            gameCfg?.metrics.map(m => (
              <View key={m.key} style={s.chartCard}>
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

  // ── Session detail view ───────────────────────────────────────────────────
  if (selectedSession) {
    const date    = new Date(selectedSession.startTime);
    const dateStr = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const queue   = selectedSession.gameQueue.length > 0 ? selectedSession.gameQueue : Object.keys(selectedSession.games);
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={s.header}>
          <TouchableOpacity onPress={() => setSelectedSession(null)} style={s.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Session Results</Text>
            <Text style={s.headerSub}>{dateStr} · {timeStr}</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>
        <ScrollView contentContainerStyle={s.detailContent} showsVerticalScrollIndicator={false}>
          {queue.map(gameKey => {
            const gameCfg  = GAMES.find(g => g.key === gameKey);
            const metrics  = selectedSession.games[gameKey] ?? {};
            if (metrics.played === false) return null;
            const mkKeys   = SESSION_METRIC_KEYS[gameKey] ?? [];
            return (
              <TouchableOpacity
                key={gameKey}
                style={s.sessionGameCard}
                onPress={() => setSessionGameKey(gameKey)}
                activeOpacity={0.75}
              >
                <View style={s.sessionGameHeader}>
                  <Ionicons name={(gameCfg?.icon ?? 'game-controller-outline') as any} size={18} color={gameCfg?.color ?? '#6366F1'} />
                  <Text style={[s.sessionGameName, { color: gameCfg?.color ?? '#6366F1' }]}>
                    {gameCfg?.name ?? gameKey}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Ionicons name="trending-up-outline" size={14} color="#9CA3AF" />
                  <Text style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 2 }}>View trends</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
                </View>
                <View style={s.sessionMetricsRow}>
                  {mkKeys.map(mk => (
                    <View key={mk} style={s.sessionMetricItem}>
                      <Text style={s.sessionMetricLabel}>{fmtMetricKey(mk)}</Text>
                      <Text style={s.sessionMetricValue}>{fmtMetricValue(extractValue(metrics, mk) ?? metrics[mk])}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  const loading = activeTab === 'individual' ? loadingInd : loadingSess;

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={s.header}>
        <View><Text style={s.headerTitle}>Statistics</Text></View>
      </View>

      {/* Tab toggle */}
      <View style={s.tabRow}>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === 'individual' && s.tabBtnActive]}
          onPress={() => { setActiveTab('individual'); setSelectedGame(null); }}
        >
          <Text style={[s.tabBtnText, activeTab === 'individual' && s.tabBtnTextActive]}>Individual</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === 'full_session' && s.tabBtnActive]}
          onPress={() => { setActiveTab('full_session'); setSelectedGame(null); }}
        >
          <Text style={[s.tabBtnText, activeTab === 'full_session' && s.tabBtnTextActive]}>Full Session</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={s.loadingText}>Loading...</Text>
        </View>
      ) : activeTab === 'full_session' ? (
        /* ── Full Session: session list ── */
        <ScrollView contentContainerStyle={s.gridContent} showsVerticalScrollIndicator={false}>
          {sessions.length === 0 ? (
            <View style={s.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text style={s.emptyTitle}>No sessions yet</Text>
              <Text style={s.emptyBody}>Complete a full session to see it here.</Text>
            </View>
          ) : sessions.map((sess, idx) => {
            const date      = new Date(sess.startTime);
            const dateStr   = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr   = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            const played    = Object.values(sess.games).filter(g => g?.played !== false).length;
            return (
              <TouchableOpacity
                key={sess.id}
                style={s.gameCard}
                onPress={() => setSelectedSession(sess)}
                activeOpacity={0.75}
              >
                <View style={[s.gameIconWrap, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="clipboard-outline" size={22} color="#6366F1" />
                </View>
                <View style={s.gameCardBody}>
                  <Text style={s.gameName}>Session {sessions.length - idx}</Text>
                  <Text style={s.gameCategory}>{dateStr} · {timeStr}</Text>
                </View>
                <View style={s.gameCardRight}>
                  <Text style={s.gameValue}>{played}</Text>
                  <Text style={s.gameSessionCount}>games</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        /* ── Individual: game cards ── */
        <ScrollView contentContainerStyle={s.gridContent} showsVerticalScrollIndicator={false}>
          {GAMES.map(game => {
            const records   = indHistory[game.key] ?? [];
            const latest    = records[records.length - 1];
            const latestVal = latest ? extractValue(latest.metrics, game.primaryMetric) : null;
            const prevVal   = records.length > 1 ? extractValue(records[records.length - 2].metrics, game.primaryMetric) : null;
            const delta     = latestVal !== null && prevVal !== null ? latestVal - prevVal : null;
            const cfg       = game.metrics.find(m => m.key === game.primaryMetric);
            const isGood    = delta === null ? null : cfg?.lowerBetter ? delta < 0 : delta > 0;
            const trendColor= isGood === null ? '#9CA3AF' : isGood ? '#10B981' : '#EF4444';
            const trendIcon = delta === null ? null : delta === 0 ? 'remove-outline' : delta > 0 ? 'trending-up-outline' : 'trending-down-outline';
            return (
              <TouchableOpacity key={game.key} style={s.gameCard} onPress={() => setSelectedGame(game)} activeOpacity={0.75}>
                <View style={[s.gameIconWrap, { backgroundColor: game.color + '18' }]}>
                  <Ionicons name={game.icon as any} size={26} color={game.color} />
                </View>
                <View style={s.gameCardBody}>
                  <Text style={s.gameName}>{game.name}</Text>
                  <Text style={s.gameCategory}>{game.category}</Text>
                </View>
                <View style={s.gameCardRight}>
                  <Text style={s.gameValue}>{fmtVal(latestVal)}</Text>
                  <Text style={s.gameSessionCount}>{records.length} play{records.length !== 1 ? 's' : ''}</Text>
                  {trendIcon && <Ionicons name={trendIcon as any} size={14} color={trendColor} />}
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

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#FAFAFA' },
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn:    { padding: 4, marginRight: 8 },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  headerSub:    { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  loadingWrap:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText:  { fontSize: 14, color: '#6B7280' },
  gridContent:  { padding: 20, paddingBottom: 40 },
  detailContent:{ padding: 20, paddingBottom: 40 },
  gameCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', gap: 12 },
  gameIconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  gameCardBody: { flex: 1 },
  gameName:     { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  gameCategory: { fontSize: 11, color: '#9CA3AF', marginTop: 2, fontWeight: '500', textTransform: 'uppercase' },
  gameCardRight:{ alignItems: 'flex-end', gap: 2 },
  gameValue:    { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  gameSessionCount: { fontSize: 10, color: '#9CA3AF' },
  chartCard:  { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#6B7280' },
  emptyBody:  { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 8 },
  tabBtn:     { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: '#F3F4F6' },
  tabBtnActive: { backgroundColor: '#6366F1' },
  tabBtnText:   { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabBtnTextActive: { color: '#FFFFFF' },
  sessionGameCard:   { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  sessionGameHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sessionGameName:   { fontSize: 14, fontWeight: '700' },
  sessionMetricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sessionMetricItem: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 8, minWidth: 90 },
  sessionMetricLabel:{ fontSize: 10, color: '#9CA3AF', marginBottom: 2, textTransform: 'uppercase' },
  sessionMetricValue:{ fontSize: 14, fontWeight: '700', color: '#1F2937' },
});
