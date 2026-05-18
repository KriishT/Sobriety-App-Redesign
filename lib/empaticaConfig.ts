// AWS S3 bucket config — credentials are stored in Firebase Secrets and used
// only by the Cloud Function. The app itself never calls S3 directly.
export const EMPATICA_S3 = {
  bucket: 'empatica-us-east-1-prod-data',
  region: 'us-east-1',
};

// Runtime participant config — set once at app startup from AsyncStorage.
// Falls back to empty strings so nothing crashes before setup is complete.
let _orgId         = '';
let _siteId        = '';
let _participantId = '';
let _deviceId      = '';
let _subjectId     = '';
let _fullId        = '';

export function setActiveParticipant(config: {
  orgId: string;
  siteId: string;
  participantId: string;
  deviceId: string;
  subjectId: string;
  fullId: string;
}) {
  _orgId         = config.orgId;
  _siteId        = config.siteId;
  _participantId = config.participantId;
  _deviceId      = config.deviceId;
  _subjectId     = config.subjectId;
  _fullId        = config.fullId;
}

export const EMPATICA_PARTICIPANT = {
  get orgId()         { return _orgId; },
  get siteId()        { return _siteId; },
  get participantId() { return _participantId; },
  get deviceId()      { return _deviceId; },
  get subjectId()     { return _subjectId; },
  get fullId()        { return _fullId; },
};
