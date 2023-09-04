import { ActivityType } from '@/lib/activity';

// TODO: pull this from DB.
export const RewardMapping: Record<string, ActivityType> = {
  'ea082f5e-6497-4874-94e0-31c6169b0f17': ActivityType.AddSongToQueue,
  'd5153e12-a192-4644-8e50-11d92769d000': ActivityType.SkipSong,
  '4b83dbd5-b3da-4a27-9789-ceeef443c6e2': ActivityType.Votekick
};
