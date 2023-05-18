import { Prisma } from "@prisma/client";
import { createTRPCContext } from "../trpc";
import { inferAsyncReturnType } from "@trpc/server";

import { SerializedTweet } from "~/common/types";

export async function getInfiniteTweets({
  whereClause,
  limit,
  cursor,
  ctx,
}: {
  whereClause?: Prisma.TweetWhereInput;
  limit: number;
  cursor: { id: string; createdAt: Date } | undefined;
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
}) {
  const currentUserId = ctx.session?.user.id;

  const data = await ctx.prisma.tweet.findMany({
    take: limit + 1, // the +1 tweet will be used as cursor (reference) to request the next tweets after limi + 1
    cursor: cursor ? { createdAt_id: cursor } : undefined, // uses a unique identifier between createAt and id properties (see `schema.prisma`)
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: whereClause,
    select: {
      id: true,
      content: true,
      createdAt: true,
      _count: { select: { likes: true } },
      likes: currentUserId ? { where: { userId: currentUserId } } : false,
      user: {
        select: { name: true, id: true, image: true },
      },
    },
  });
  // get the nextCursor
  let nextCursor: typeof cursor | undefined;
  if (data.length > limit) {
    const nextTweet = data.pop();
    nextCursor = nextTweet
      ? { id: nextTweet?.id, createdAt: nextTweet?.createdAt }
      : undefined;
  }

  return {
    tweets: data.map((tweet) => {
      return {
        id: tweet.id,
        content: tweet.content,
        createdAt: tweet.createdAt,
        likesCount: tweet._count.likes,
        user: tweet.user,
        likedByMe: tweet.likes?.length > 0,
      } as SerializedTweet;
    }),
    nextCursor,
  };
}
