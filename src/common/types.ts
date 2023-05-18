export type SerializedTweet = {
  id: string;
  content: string;
  createdAt: Date;
  likesCount: number;
  user: {
    id: string;
    name: string | null | undefined;
    image: string | null | undefined;
  };
  likedByMe: boolean;
};
