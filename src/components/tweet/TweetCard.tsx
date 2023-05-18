import Link from "next/link";

import { SerializedTweet } from "~/common/types";
import { PROFILE_PATH } from "~/common/constants";
import { dateTimeFormatter } from "~/common/utils";

import HeartLikeButton from "./HeartLikeButton";
import ProfileImage from "../ui/ProfileImage";

import { api } from "~/utils/api";

export default function TweetCard({
  id,
  content,
  createdAt,
  likedByMe,
  likesCount,
  user,
}: SerializedTweet) {
  // utility functions from TRPC
  const trpcUtils = api.useContext();
  type SetInfiniteDataType =
    typeof trpcUtils.tweet.infiniteTweets.setInfiniteData;

  const toggleLike = api.tweet.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
      // to get the updater function (remove `[1]` to see result)
      const updateData: Parameters<SetInfiniteDataType>[1] = (cachedData) => {
        if (!cachedData) return;

        const countLikesModifier = addedLike ? 1 : -1;

        return {
          ...cachedData,
          pages: cachedData.pages.map((page) => {
            return {
              ...page,
              tweets: page.tweets.map((tweet) => {
                if (tweet.id === id) {
                  return {
                    ...tweet,
                    likesCount: tweet.likesCount + countLikesModifier,
                    likedByMe: addedLike,
                  };
                }
                return tweet;
              }),
            };
          }),
        };
      };

      // execute update data
      trpcUtils.tweet.infiniteTweets.setInfiniteData({}, updateData);
      trpcUtils.tweet.infiniteTweets.setInfiniteData(
        { onlyFollowing: true },
        updateData
      );
      trpcUtils.tweet.infiniteProfileTweets.setInfiniteData(
        { userId: user.id },
        updateData
      );
    },
  });

  const handleToggleLike = () => {
    toggleLike.mutate({ id });
  };

  return (
    <li className="flex gap-4 border-b p-4">
      <Link href={`${PROFILE_PATH}/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className="flex flex-grow flex-col">
        <div className="flex gap-1">
          <Link
            href={`${PROFILE_PATH}/${user.id}`}
            className="font-bold outline-none  hover:underline focus-visible:underline"
          >
            {user.name}
          </Link>
          <span className="text-gray-500">-</span>
          <span className="text-gray-500">{dateTimeFormatter(createdAt)}</span>
        </div>
        {/* whitespace-pre-wrap is used to keep the new lines (enters) */}
        <p className="whitespace-pre-wrap">{content}</p>
        <HeartLikeButton
          likeByMe={likedByMe}
          likesCount={likesCount}
          onClick={handleToggleLike}
          isLoading={toggleLike.isLoading}
        />
      </div>
    </li>
  );
}
