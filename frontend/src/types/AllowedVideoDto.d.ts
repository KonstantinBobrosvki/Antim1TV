export type AllowedVideoDto = {
  id: number;

  votes: number;

  queuePositon: number;

  video: {
    id: number;

    link: string;

    isAllowed?: boolean;

    queueId: number;

    createdDate: Date;
  };
};
