import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveSession } from './saveSession';
import { linkSessionToUploads } from './uploadQueue';

// Each pending session gets its OWN AsyncStorage key keyed by participantId +
// session start timestamp. Writing the same key twice just overwrites with
// newer data — idempotent, no shared array, no race conditions between
// concurrent enqueueSession calls.
const sessionKey = (participantId: string, startMs: number) =>
  `@pending_session_${participantId}_${startMs}`;

export interface PendingSession {
  participantId: string;
  startTime: string;
  endTime: string;
  results: Record<string, any>;
  gameTimes: Record<string, string>;
  status: 'complete' | 'partial';
  gameQueue: string[];
  existingDocId: string | null;
  queuedAt: string;
}

// Writes (or overwrites) the pending session entry for this session.
// Because we key by participantId+startTime, concurrent calls for the same
// session simply overwrite each other — only the latest data survives,
// which is always what we want.
export async function enqueueSession(
  participantId: string,
  startTime: Date,
  endTime: Date,
  results: Record<string, any>,
  gameTimes: Record<string, string>,
  status: 'complete' | 'partial',
  gameQueue: string[],
  existingDocId?: string,
): Promise<void> {
  try {
    const key = sessionKey(participantId, startTime.getTime());
    const entry: PendingSession = {
      participantId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      results,
      gameTimes,
      status,
      gameQueue,
      existingDocId: existingDocId ?? null,
      queuedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
    console.log(`[SessionQueue] Queued session: ${key}`);
  } catch (e) {
    console.log('[SessionQueue] enqueue error:', e);
  }
}

// Removes the queued entry for this session — called when saveSession succeeds
// so the queue entry is never replayed and a duplicate doc is never created.
export async function clearSessionFromQueue(
  participantId: string,
  startTimeIso: string,
): Promise<void> {
  try {
    const key = sessionKey(participantId, new Date(startTimeIso).getTime());
    await AsyncStorage.removeItem(key);
    console.log(`[SessionQueue] Cleared: ${key}`);
  } catch (e) {
    console.log('[SessionQueue] clearSessionFromQueue error:', e);
  }
}

// Concurrency guard — prevents two simultaneous processSessionQueue runs.
let _processing = false;

// Scans all pending session keys and replays each save.
// Called on app start (after auth confirmed) and on network reconnect.
export async function processSessionQueue(): Promise<void> {
  if (_processing) return;
  _processing = true;

  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const pending = allKeys.filter(k => k.startsWith('@pending_session_'));
    if (pending.length === 0) return;

    console.log(`[SessionQueue] Processing ${pending.length} pending session(s)...`);

    for (const key of pending) {
      try {
        // Re-read the key — a concurrent saveSession success may have removed it.
        const raw = await AsyncStorage.getItem(key);
        if (!raw) {
          console.log(`[SessionQueue] ${key} already cleared, skipping`);
          continue;
        }

        const entry: PendingSession = JSON.parse(raw);
        const docId = await saveSession(
          entry.participantId,
          new Date(entry.startTime),
          new Date(entry.endTime),
          entry.results,
          entry.gameTimes,
          entry.status,
          entry.gameQueue,
          entry.existingDocId ?? undefined,
          true, // _isRetry — skip re-queuing if this also fails
        );

        if (docId) {
          console.log(`[SessionQueue] Saved: ${docId}`);
          await AsyncStorage.removeItem(key);
          await linkSessionToUploads(
            entry.participantId,
            entry.startTime,
            entry.endTime,
            docId,
          );
        } else {
          console.log(`[SessionQueue] Still failing for ${key}, keeping`);
        }
      } catch (e) {
        console.log(`[SessionQueue] Error processing ${key}:`, e);
      }
    }
  } finally {
    _processing = false;
  }
}
