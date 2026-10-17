import { IAvatarAdapter, AvatarProvider, AvatarSession, AvatarSessionConfig, SpeechRequest, SpeechResult } from '../types';

export class HeygenAdapter implements IAvatarAdapter {
  public providerName: AvatarProvider = 'heygen';
  private apiKey: string;
  private baseUrl = 'https://api.heygen.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.AVATAR_PROVIDER_API_KEY || '';
  }

  public isVoiceBundled(): boolean {
    // HeyGen streaming sessions include default TTS voice synthesis in the session time
    return true;
  }

  public getEstimatedPerMinuteRate(): number {
    // ~$0.05/sec => $3.00 / minute on pay-as-you-go API
    return 3.00;
  }

  public async createSession(config: AvatarSessionConfig): Promise<AvatarSession> {
    if (!this.apiKey) {
      return {
        sessionId: `heygen-mock-${Date.now()}`,
        provider: 'heygen',
        status: 'idle',
        error: 'Missing HeyGen API key in environment variables'
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/streaming.new`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quality: 'medium',
          avatar_id: config.avatarId || 'default_male_avatar',
          voice: {
            voice_id: config.voiceId || 'hi-IN-Standard-A'
          }
        })
      });

      if (!res.ok) {
        throw new Error(`HeyGen streaming session failed with status ${res.status}`);
      }

      const data = await res.json();
      return {
        sessionId: data.data.session_id,
        provider: 'heygen',
        status: 'initializing',
        webrtc: {
          sessionId: data.data.session_id,
          sdp: data.data.sdp.sdp,
          type: 'offer',
          iceServers: data.data.ice_servers
        }
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown HeyGen error';
      return {
        sessionId: `err-${Date.now()}`,
        provider: 'heygen',
        status: 'error',
        error: message
      };
    }
  }

  public async speak(request: SpeechRequest): Promise<SpeechResult> {
    const approximateDuration = Math.max(3000, request.scriptText.split(' ').length * 360);

    return {
      success: true,
      durationMs: approximateDuration,
      captionTrack: {
        avatarConfigId: request.sessionId,
        segments: [
          { startMs: 0, endMs: Math.round(approximateDuration * 0.5), text: request.scriptText.slice(0, Math.round(request.scriptText.length * 0.5)) },
          { startMs: Math.round(approximateDuration * 0.5), endMs: approximateDuration, text: request.scriptText.slice(Math.round(request.scriptText.length * 0.5)) }
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

  public async closeSession(sessionId: string): Promise<boolean> {
    if (!this.apiKey || sessionId.startsWith('heygen-mock')) return true;

    try {
      await fetch(`${this.baseUrl}/streaming.stop`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: sessionId })
      });
      return true;
    } catch {
      return false;
    }
  }
}
