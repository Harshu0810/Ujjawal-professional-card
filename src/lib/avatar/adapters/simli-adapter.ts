import { IAvatarAdapter, AvatarProvider, AvatarSession, AvatarSessionConfig, SpeechRequest, SpeechResult } from '../types';

export class SimliAdapter implements IAvatarAdapter {
  public providerName: AvatarProvider = 'simli';
  private apiKey: string;
  private baseUrl = 'https://api.simli.ai';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.AVATAR_PROVIDER_API_KEY || '';
  }

  public isVoiceBundled(): boolean {
    // Simli is an audio-to-video real-time layer; audio is passed in or driven via low-cost TTS integration
    return true;
  }

  public getEstimatedPerMinuteRate(): number {
    // ~$0.018 / minute ($1.08 / hour) — lowest cost real-time tier
    return 0.018;
  }

  public async createSession(config: AvatarSessionConfig): Promise<AvatarSession> {
    if (!this.apiKey) {
      return {
        sessionId: `simli-mock-${Date.now()}`,
        provider: 'simli',
        status: 'idle',
        error: 'Missing Simli API key in environment variables'
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/startAudioToVideoSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          faceId: config.avatarId || 'default-avatar-male',
          handleSilence: true,
          maxSessionLength: 300 // 5 minutes cap to protect budget
        })
      });

      if (!res.ok) {
        throw new Error(`Simli session creation failed with status ${res.status}`);
      }

      const data = await res.json();
      return {
        sessionId: data.session_token || `simli-${Date.now()}`,
        provider: 'simli',
        status: 'initializing',
        webrtc: {
          sessionId: data.session_token,
          sdp: '',
          type: 'offer'
        }
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Simli error';
      return {
        sessionId: `err-${Date.now()}`,
        provider: 'simli',
        status: 'error',
        error: message
      };
    }
  }

  public async speak(request: SpeechRequest): Promise<SpeechResult> {
    const approximateDuration = Math.max(3000, request.scriptText.split(' ').length * 350);

    return {
      success: true,
      durationMs: approximateDuration,
      captionTrack: {
        avatarConfigId: request.sessionId,
        segments: [
          { startMs: 0, endMs: Math.round(approximateDuration * 0.45), text: request.scriptText.slice(0, Math.round(request.scriptText.length * 0.5)) },
          { startMs: Math.round(approximateDuration * 0.45), endMs: approximateDuration, text: request.scriptText.slice(Math.round(request.scriptText.length * 0.5)) }
        ],
        fontFamily: 'Inter, sans-serif',
        fontSize: '1.05rem',
        textColor: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        position: 'bottom-center',
        needsResync: false
      }
    };
  }

  public async closeSession(): Promise<boolean> {
    return true;
  }
}
