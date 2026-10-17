/**
 * Vendor-Neutral Runtime Avatar Adapter Architecture
 * Supporting D-ID, HeyGen, Simli, and Local Dev Mock.
 */

import { CaptionTrack, AvatarPlaybackMode } from '@/types/content';

export type AvatarProvider = 'd-id' | 'heygen' | 'simli' | 'mock';

export interface AvatarSessionConfig {
  provider: AvatarProvider;
  avatarId?: string;
  sourceImageUrl?: string;
  voiceId?: string;
  language: 'hinglish' | 'en' | 'hi';
  playbackMode: AvatarPlaybackMode;
}

export interface WebRtcParameters {
  sdp: string;
  type: 'offer' | 'answer';
  iceServers?: RTCIceServer[];
  sessionId: string;
}

export interface AvatarSession {
  sessionId: string;
  provider: AvatarProvider;
  status: 'initializing' | 'connected' | 'speaking' | 'idle' | 'closed' | 'error';
  webrtc?: WebRtcParameters;
  streamUrl?: string;
  error?: string;
}

export interface SpeechRequest {
  sessionId: string;
  scriptText: string;
  language?: string;
  speedMultiplier?: number;
}

export interface SpeechResult {
  success: boolean;
  captionTrack: CaptionTrack;
  durationMs: number;
}

export interface IAvatarAdapter {
  providerName: AvatarProvider;
  createSession(config: AvatarSessionConfig): Promise<AvatarSession>;
  sendIceCandidate?(sessionId: string, candidate: RTCIceCandidateInit): Promise<boolean>;
  speak(request: SpeechRequest): Promise<SpeechResult>;
  closeSession(sessionId: string): Promise<boolean>;
  isVoiceBundled(): boolean; // Section 3A Option 1: returns true if stock TTS is included without add-on fees
  getEstimatedPerMinuteRate(): number; // in USD
}
