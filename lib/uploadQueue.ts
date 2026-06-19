import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { uploadVideo, uploadAudio } from './firebaseStorage';
import { patchSessionVideoUrl, patchSessionAudioUrl } from './firestore';

const QUEUE_KEY = '@vp_upload_queue';

export interface PendingUpload {
  id: string;
  type: 'video' | 'audio';
  localUri: string;
  subjectId: string;        // used for video path
  participantId: string;    // used for audio path
  gameType: string;
  label: string;            // round key for video, phrase text for audio
  round: string;            // round key for video, phrase index (string) for audio
  sessionDocId: string | null;
  recordedAt: string;
}

export async function enqueueUpload(item: Omit<PendingUpload, 'id'>): Promise<void> {
  try {
    const existing = await getPendingUploads();
    const entry: PendingUpload = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify([...existing, entry]));
    console.log(`[UploadQueue] Queued ${item.round} for retry: ${item.localUri}`);
  } catch (e) {
    console.log('[UploadQueue] enqueue error:', e);
  }
}

export async function getPendingUploads(): Promise<PendingUpload[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as PendingUpload[]) : [];
  } catch {
    return [];
  }
}

// Called by processSessionQueue after a session doc is created — links any
// pending upload entries that have sessionDocId:null but belong to this session.
// Uses a 15-minute buffer around the session window to account for background
// processing time between recording and the upload being enqueued.
export async function linkSessionToUploads(
  participantId: string,
  startTime: string,
  endTime: string,
  sessionDocId: string,
): Promise<void> {
  try {
    const queue = await getPendingUploads();
    // 1 min before session start, 8 min after session end (covers VP background
    // job which runs after all 4 rounds and uploads then).
    const startMs = new Date(startTime).getTime() - 1  * 60 * 1000;
    const endMs   = new Date(endTime).getTime()   + 8  * 60 * 1000;

    let changed = false;
    const updated = queue.map(entry => {
      if (
        entry.sessionDocId === null &&
        entry.participantId === participantId &&
        new Date(entry.recordedAt).getTime() >= startMs &&
        new Date(entry.recordedAt).getTime() <= endMs
      ) {
        changed = true;
        return { ...entry, sessionDocId };
      }
      return entry;
    });

    if (changed) {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
      console.log(`[UploadQueue] Linked pending uploads to session ${sessionDocId}`);
    }
  } catch (e) {
    console.log('[UploadQueue] linkSessionToUploads error:', e);
  }
}

async function removeFromQueue(id: string): Promise<void> {
  try {
    const existing = await getPendingUploads();
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(existing.filter(e => e.id !== id)));
  } catch (e) {
    console.log('[UploadQueue] remove error:', e);
  }
}

// Processes all queued uploads. Called on app start and whenever connectivity is restored.
// Each entry is attempted once per call — failures stay in the queue for the next run.
export async function processQueue(): Promise<void> {
  const pending = await getPendingUploads();
  if (pending.length === 0) return;

  console.log(`[UploadQueue] Processing ${pending.length} pending upload(s)...`);

  for (const item of pending) {
    try {
      // If the local file was cleared (e.g. app reinstalled), drop the entry
      const info = await FileSystem.getInfoAsync(item.localUri);
      if (!info.exists) {
        console.log(`[UploadQueue] Local file gone for ${item.round} — removing`);
        await removeFromQueue(item.id);
        continue;
      }

      let uploadedUrl: string | null = null;

      if (item.type === 'audio') {
        uploadedUrl = await uploadAudio(
          item.localUri,
          item.participantId,
          item.label,
          Number(item.round),
        );
      } else {
        uploadedUrl = await uploadVideo(
          item.localUri,
          item.subjectId,
          item.gameType,
          item.label,
        );
      }

      if (!uploadedUrl) {
        console.log(`[UploadQueue] Still failing for ${item.round}, will retry later`);
        continue;
      }

      console.log(`[UploadQueue] Retry succeeded for ${item.round}: ${uploadedUrl}`);

      if (item.sessionDocId) {
        if (item.type === 'audio') {
          await patchSessionAudioUrl(item.sessionDocId, uploadedUrl);
        } else {
          await patchSessionVideoUrl(item.sessionDocId, item.gameType, item.round, uploadedUrl);
        }
      }

      // Done — remove from queue and free local storage
      await removeFromQueue(item.id);
      try {
        await FileSystem.deleteAsync(item.localUri, { idempotent: true });
      } catch {}
    } catch (e) {
      console.log(`[UploadQueue] Error processing ${item.round}:`, e);
    }
  }
}
