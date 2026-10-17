import { IAvatarAdapter, AvatarProvider } from './types';
import { DidAdapter } from './adapters/did-adapter';
import { HeygenAdapter } from './adapters/heygen-adapter';
import { SimliAdapter } from './adapters/simli-adapter';
import { MockAdapter } from './adapters/mock-adapter';

export function getAvatarAdapter(preferredProvider?: AvatarProvider): IAvatarAdapter {
  const provider = preferredProvider || (process.env.AVATAR_PROVIDER as AvatarProvider) || 'mock';

  switch (provider) {
    case 'd-id':
      return new DidAdapter();
    case 'heygen':
      return new HeygenAdapter();
    case 'simli':
      return new SimliAdapter();
    case 'mock':
    default:
      return new MockAdapter();
  }
}

export * from './types';
