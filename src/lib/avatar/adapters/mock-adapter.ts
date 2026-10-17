import { IAvatarAdapter, AvatarProvider, AvatarSession, AvatarSessionConfig, SpeechRequest, SpeechResult } from '../types';

export class MockAdapter implements IAvatarAdapter {
  public providerName: AvatarProvider = 'mock';

  public isVoiceBundled(): boolean {
    return true;
  }

  public getEstimatedPerMinuteRate(): number {
    return 0.00;
  }

  public async createSession(_config: AvatarSessionConfig): Promise<AvatarSession> {
    void _config;
    return {
      sessionId: `mock-session-${Date.now()}`,
      provider: 'mock',
      status: 'connected',
      streamUrl: '/media/mock-avatar-stream.mp4',
      webrtc: {
        sessionId: `mock-webrtc-${Date.now()}`,
        sdp: 'v=0\r\no=- 12345 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n',
        type: 'offer'
      }
    };
  }

  public async speak(request: SpeechRequest): Promise<SpeechResult> {
    // Generate accurate Hinglish caption segments matching Section 3C
    const words = request.scriptText.split(' ');
    const durationMs = Math.max(3000, words.length * 360);

    const segmentCount = Math.min(3, Math.max(1, Math.ceil(words.length / 8)));
    const wordsPerSegment = Math.ceil(words.length / segmentCount);
    const timePerSegment = Math.round(durationMs / segmentCount);

    const segments = [];
    for (let i = 0; i < segmentCount; i++) {
      const startMs = i * timePerSegment;
      const endMs = i === segmentCount - 1 ? durationMs : (i + 1) * timePerSegment;
      const segWords = words.slice(i * wordsPerSegment, (i + 1) * wordsPerSegment);
      segments.push({
        startMs,
        endMs,
        text: segWords.join(' ')
      });
    }

    return {
      success: true,
      durationMs,
      captionTrack: {
        avatarConfigId: request.sessionId,
        segments,
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
