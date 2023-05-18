import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { PROFILE_PATH } from "~/common/constants";

import { getInfiniteTweets } from "../utils/tweet.utils";

const TWEET_LIMIT_DEFAULT = 10;

export const tweetRouter = createTRPCRouter({
  // Gets specific user tweets
  infiniteProfileTweets: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(
      async ({
        input: { userId, limit = TWEET_LIMIT_DEFAULT, cursor },
        ctx,
      }) => {
        return await getInfiniteTweets({
          whereClause: { userId },
          limit,
          cursor,
          ctx,
        });
      }
    ),
  infiniteTweets: publicProcedure
    .input(
      z.object({
        onlyFollowing: z.boolean().optional(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(
      async ({
        input: { onlyFollowing = false, limit = TWEET_LIMIT_DEFAULT, cursor },
        ctx,
      }) => {
        const currentUserId = ctx.session?.user.id;
        return await getInfiniteTweets({
          // if logged in and no asking for the following info
          // get just the recent tweets
          whereClause:
            !currentUserId || !onlyFollowing
              ? undefined
              : // otherwise, get the tweets for the users that
                // current user is following
                {
                  user: {
                    followers: { some: { id: currentUserId } },
                  },
                },
          limit,
          cursor,
          ctx,
        });
      }
    ),
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {
      const tweet = await ctx.prisma.tweet.create({
        data: { content, userId: ctx.session.user.id },
      });

      // revalidate everytime a new tweet is created
      void ctx.revalidateSSG?.(`${PROFILE_PATH}/${ctx.session.user.id}`);

      return tweet;
    }),
  toggleLike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const data = { tweetId: id, userId: ctx.session.user.id };

      const existingLike = await ctx.prisma.like.findUnique({
        where: { userId_tweetId: data },
      });

      if (existingLike == null) {
        await ctx.prisma.like.create({ data });
        return { addedLike: true };
      } else {
        await ctx.prisma.like.delete({ where: { userId_tweetId: data } });
        return { addedLike: false };
      }
    }),
});
