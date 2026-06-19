import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { EMPATICA_PARTICIPANT } from './empaticaConfig';
import { retryAsync } from './retry';

const EMPATICA_GAMES = new Set(['walk_and_turn', 'single_leg_stand']);

export async function saveSession(
  participantId: string,
  startTime: Date,
  endTime: Date,
  results: Record<string, any>,
  gameTimes: Record<string, string> = {},
  status: 'complete' | 'partial' = 'complete',
  gameQueue: string[] = [],
  existingDocId?: string,
  // Pass true when called from the retry queue to prevent re-queuing on failure
  _isRetry = false,
): Promise<string | null> {
  try {
    const gamesOut: Record<string, any> = {};
    for (const [gameType, metrics] of Object.entries(results)) {
      if (metrics?.played === false) {
        gamesOut[gameType] = metrics;
      } else if (EMPATICA_GAMES.has(gameType)) {
        gamesOut[gameType] = {
          ...metrics,
          empaticaStatus: gameTimes[gameType] ? 'pending' : 'unavailable',
          empaticaData: null,
        };
      } else {
        gamesOut[gameType] = metrics;
      }
    }

    const playedEmpaticaGames = Object.keys(gameTimes).filter(g => EMPATICA_GAMES.has(g));
    const hasEmpaticaGames = playedEmpaticaGames.length > 0;

    const data: Record<string, any> = {
      participantId,
      userUid:   auth.currentUser?.uid   ?? null,
      userEmail: auth.currentUser?.email ?? null,
      mode: 'full_session',
      status,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationSeconds: Math.round((endTime.getTime() - startTime.getTime()) / 1000),
      games: gamesOut,
      gameTimes,
      gameQueue,
      empaticaSessionStatus: hasEmpaticaGames ? 'pending' : 'unavailable',
      empaticaOrgId:         EMPATICA_PARTICIPANT.orgId,
      empaticaSiteId:        EMPATICA_PARTICIPANT.siteId,
      empaticaParticipantId: EMPATICA_PARTICIPANT.participantId,
      empaticaDeviceId:      EMPATICA_PARTICIPANT.deviceId,
      empaticaSubjectId:     EMPATICA_PARTICIPANT.subjectId,
    };

    if (existingDocId) {
      // Use dot-notation for every game field so a later savePartialSession never
      // clobbers a background-job patch (e.g. VP video results) that already landed.
      const { games, ...rest } = data;
      const dotGames: Record<string, any> = {};
      for (const [k, v] of Object.entries(games as Record<string, any>)) {
        dotGames[`games.${k}`] = v;
      }
      // Single attempt with a fast 3 s timeout — if Firestore isn't reachable,
      // fail quickly and let the sessionQueue retry when internet is back.
      // This keeps the session-complete screen's "saving" spinner to < 5 s.
      await retryAsync(() => updateDoc(doc(db, 'sessions', existingDocId), { ...rest, ...dotGames }), 1, 500);
      console.log('[Session] Updated session:', existingDocId);
      // Clear any queued entries for this session — save succeeded so they'd create duplicates.
      const { clearSessionFromQueue } = await import('./sessionQueue');
      await clearSessionFromQueue(participantId, startTime.toISOString());
      return existingDocId;
    } else {
      const docRef = await retryAsync(() => addDoc(collection(db, 'sessions'), {
        ...data,
        createdAt: serverTimestamp(),
      }), 1, 500);
      console.log('[Session] Saved session:', docRef.id);
      const { clearSessionFromQueue } = await import('./sessionQueue');
      await clearSessionFromQueue(participantId, startTime.toISOString());
      return docRef.id;
    }
  } catch (e) {
    console.log('[Session] Save error (all retries failed):', e);
    if (!_isRetry) {
      // Queue for retry on next app open or reconnect.
      // Skipped when called from processSessionQueue to avoid duplicate entries.
      const { enqueueSession } = await import('./sessionQueue');
      await enqueueSession(participantId, startTime, endTime, results, gameTimes, status, gameQueue, existingDocId);
    }
    return null;
  }
}
