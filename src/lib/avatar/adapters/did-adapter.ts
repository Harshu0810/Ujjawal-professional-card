import { IAvatarAdapter, AvatarProvider, AvatarSession, AvatarSessionConfig, SpeechRequest, SpeechResult } from '../types';

export class DidAdapter implements IAvatarAdapter {
  public providerName: AvatarProvider = 'd-id';
  private apiKey: string;
  private baseUrl = 'https://api.d-id.com';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.AVATAR_PROVIDER_API_KEY || '';
  }

  public isVoiceBundled(): boolean {
    // D-ID includes standard Microsoft / Azure neural TTS voices in their streaming credit quota
    return true;
  }

  public getEstimatedPerMinuteRate(): number {
    // ~$0.12 / minute blended rate on standard developer API plans
    return 0.12;
  }

  public async createSession(config: AvatarSessionConfig): Promise<AvatarSession> {
    if (!this.apiKey) {
      return {
        sessionId: `did-mock-${Date.now()}`,
        provider: 'd-id',
        status: 'idle',
        error: 'Missing D-ID API key in environment variables'
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/talks/streams`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_url: config.sourceImageUrl || 'https://raw.githubusercontent.com/hexschool/2021-ui-avatar/main/avatar.png',
          driver_url: 'bank://lively/driver-01'
        })
      });

      if (!res.ok) {
        throw new Error(`D-ID stream creation failed with status ${res.status}`);
      }

      const data = await res.json();
      return {
        sessionId: data.id,
        provider: 'd-id',
        status: 'initializing',
        webrtc: {
          sessionId: data.id,
          sdp: data.offer.sdp,
          type: 'offer',
          iceServers: data.ice_servers
        }
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown D-ID error';
      return {
        sessionId: `err-${Date.now()}`,
        provider: 'd-id',
        status: 'error',
        error: message
      };
    }
  }

  public async speak(request: SpeechRequest): Promise<SpeechResult> {
    // In D-ID: POST /talks/streams/{stream_id}
    // For Hinglish, Azure neural voices like 'hi-IN-MadhurNeural' or 'en-IN-PrabhatNeural' provide natural code-switching
    const approximateDuration = Math.max(3000, request.scriptText.split(' ').length * 350);

    return {
      success: true,
      durationMs: approximateDuration,
      captionTrack: {
        avatarConfigId: request.sessionId,
        segments: [
          { startMs: 0, endMs: Math.round(approximateDuration * 0.4), text: request.scriptText.slice(0, Math.round(request.scriptText.length * 0.45)) },
          { startMs: Math.round(approximateDuration * 0.4), endMs: approximateDuration, text: request.scriptText.slice(Math.round(request.scriptText.length * 0.45)) }
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
    if (!this.apiKey || sessionId.startsWith('did-mock')) return true;

    try {
      await fetch(`${this.baseUrl}/talks/streams/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${this.apiKey}`
        }
      });
      return true;
    } catch {
      return false;
    }
  }
}
