import { z } from "zod";
import { PROFILE_PATH } from "~/common/constants";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id }, ctx }) => {
      const currentUserId = ctx.session?.user.id;

      const profile = await ctx.prisma.user.findUnique({
        where: { id },
        select: {
          name: true,
          image: true,
          _count: {
            select: { followers: true, following: true, tweets: true },
          },
          // Checks if the user is followed by the current user
          followers: !currentUserId
            ? undefined
            : { where: { id: currentUserId } },
        },
      });

      if (!profile) return;

      return {
        name: profile.name,
        image: profile.image,
        followersCount: profile._count.followers,
        followingCount: profile._count.following,
        tweetsCount: profile._count.tweets,
        isFollowing: profile.followers.length > 0,
      };
    }),
  toggleFollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input: { userId }, ctx }) => {
      const currentUserId = ctx.session?.user.id;

      // Existing users that the current user is following
      const existingFollowingUser = await ctx.prisma.user.findFirst({
        // if the target to follow user contains the id of the current user
        // means that the target user is already being follow by current user
        where: { id: userId, followers: { some: { id: currentUserId } } },
      });

      let addedFollower;
      // if current user is not following the target user, then follow
      if (!existingFollowingUser) {
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { followers: { connect: { id: currentUserId } } },
        });
        addedFollower = true;
      } else {
        // otherwise unfollow
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { followers: { disconnect: { id: currentUserId } } },
        });
        addedFollower = false;
      }

      // Revalidate due to profile is a generate static page and it will need to be revalidate
      // after procecing any follow operation
      void ctx.revalidateSSG?.(`${PROFILE_PATH}/${userId}`);
      void ctx.revalidateSSG?.(`${PROFILE_PATH}/${currentUserId}`);

      return { addedFollower };
    }),
});
