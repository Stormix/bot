import type { Context } from '@/types/context';

export enum ActivityType {
  Conversation = 'conversation',
  Music = 'music'
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
  [ActivityType.Music]: {
    song: string;
    context: Context;
  };
};

export default interface Activity<Type extends ActivityType> {
  type: Type;
  payload: ActivityPayload[Type];
}
