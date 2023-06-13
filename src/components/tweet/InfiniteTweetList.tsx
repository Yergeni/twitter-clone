import InfiniteScroll from "react-infinite-scroll-component";

import type { SerializedTweet } from "~/common/types";

import TweetCard from "./TweetCard";
import LoadingSpinner from "../ui/LoadingSpinner";
import Link from "next/link";

type InfiniteTweetListProps = {
  isLoading: boolean;
  hasError: boolean;
  tweets?: SerializedTweet[];
  hasMore?: boolean;
  fetchNewTweets: () => Promise<unknown>;
};

export default function InfiniteTweetList({
  tweets,
  hasError,
  isLoading,
  hasMore,
  fetchNewTweets,
}: InfiniteTweetListProps) {
  if (isLoading) return <LoadingSpinner />;
  if (hasError)
    return (
      <div className="flex items-center flex-col">
        <h1 className="text-red-500">
          Error... (NOTE: This app uses a free plan database that may be in
          sleeping mode)
        </h1>
        <Link
          className="underline text-blue-500"
          href="https://planetscale.com/docs/concepts/database-sleeping"
          target="_blank"
        >
          Read more
        </Link>
      </div>
    );

  if (!tweets || tweets.length === 0) {
    return (
      <h2 className="my-4 text-center text-2xl text-gray-500">No Tweets</h2>
    );
  }

  return (
    <ul>
      <InfiniteScroll
        dataLength={tweets.length} //This is important field to render the next data
        next={fetchNewTweets}
        hasMore={Boolean(hasMore)}
        loader={<LoadingSpinner />}
        endMessage={
          <p className="text-center">
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        {tweets.map((tweet) => {
          return <TweetCard key={tweet.id} {...tweet} />;
        })}
      </InfiniteScroll>
    </ul>
  );
}
