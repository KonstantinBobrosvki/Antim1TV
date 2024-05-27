export type VideoDto = {
  id: number;

  link: string;

  isAllowed?: boolean;

  queueId: number;

  createdDate: Date;
};
