import type { Context } from '@/types/context';

export enum ActivityType {
  Conversation = 'conversation',
  AddSongToQueue = 'addSongToQueue',
  SkipSong = 'skipSong',
  Votekick = 'votekick'
}

export type ActivityPayload = {
  [ActivityType.Conversation]: {
    text: string;
    from: {
      id: string;
      name: string;
    };
    context: Context;
  };
  [ActivityType.AddSongToQueue]: {
    song: string;
    context: Context;
  };
  [ActivityType.SkipSong]: {
    context: Context;
  };
  [ActivityType.Votekick]: {
    username: string;
    context: Context;
  };
};

export default interface Activity<Type extends ActivityType> {
  type: Type;
  payload: ActivityPayload[Type];
}
