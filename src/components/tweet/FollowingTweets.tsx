import { api } from "~/utils/api";

import InfiniteTweetList from "./InfiniteTweetList";

export default function FollowingTweets() {
  const getTweetsQuery = api.tweet.infiniteTweets.useInfiniteQuery(
    { onlyFollowing: true },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <InfiniteTweetList
      tweets={getTweetsQuery.data?.pages.flatMap((page) => page.tweets)}
      hasError={getTweetsQuery.isError}
      isLoading={getTweetsQuery.isLoading}
      hasMore={getTweetsQuery.hasNextPage}
      fetchNewTweets={getTweetsQuery.fetchNextPage}
    />
  );
}
