import type { SpotifyTokens } from '@/providers/spotify';
import type { ServiceType } from '@prisma/client';

export type CredentialsValue = {
  [ServiceType.SPOTIFY]: SpotifyTokens;
};
