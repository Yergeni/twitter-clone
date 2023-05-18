import Head from "next/head";
import Link from "next/link";
import {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import ErrorPage from "next/error";

import { VscArrowLeft } from "react-icons/vsc";

import IconHoverEffect from "~/components/ui/IconHoverEffect";
import ProfileImage from "~/components/ui/ProfileImage";
import FollowUserButton from "~/components/tweet/FollowUserButton";

/* Utils */
import { api } from "~/utils/api";
import { getPlural } from "~/common/utils";
import { ssgUtil } from "~/server/api/utils/ssg.utils";
import { InfiniteTweetList } from "~/components/tweet";

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  id,
}) => {
  const { data: profile } = api.profile.getById.useQuery({ id });

  if (!profile || !profile.name) return <ErrorPage statusCode={404} />;

  const getUserTweetsById = api.tweet.infiniteProfileTweets.useInfiniteQuery(
    {
      userId: id,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const trpcUtils = api.useContext();
  const toggleFollow = api.profile.toggleFollow.useMutation({
    onSuccess: ({ addedFollower }) => {
      trpcUtils.profile.getById.setData({id}, cacheData => {
        if (!cacheData) return;

        const countFollowerModifier = addedFollower ? 1 : -1;
        return {
          ...cacheData,
          isFollowing: addedFollower,
          followersCount: cacheData.followersCount + countFollowerModifier
        }
      })
    },
  });

  return (
    <>
      <Head>
        <title>{`Twiller Clone - ${profile.name}`}</title>
      </Head>
      <header className="sticky top-0 z-10 flex items-center border-b bg-white px-4 py-2">
        <Link href=".." className="mr-2">
          <IconHoverEffect>
            <VscArrowLeft className="h-6 w-6" />
          </IconHoverEffect>
        </Link>
        <ProfileImage src={profile.image} className="flex-shrink-0" />
        <div className="ml-2 flex-grow">
          <h1 className="text-lg font-bold">{profile.name}</h1>
          <div className="text-gray-500">
            {profile.tweetsCount}{" "}
            {getPlural(profile.tweetsCount, "Tweet", "Tweets")} -{" "}
            {profile.followersCount}{" "}
            {getPlural(profile.followersCount, "Follower", "Followers")} -{" "}
            {profile.followingCount} Following
          </div>
        </div>
        {/* Follow Button */}
        <FollowUserButton
          isFollowing={profile.isFollowing}
          userId={id}
          isLoading={toggleFollow.isLoading}
          onClick={() => toggleFollow.mutate({ userId: id })}
        />
      </header>
      {/* List of tweets posted by selected profile */}
      <main>
        <InfiniteTweetList
          tweets={getUserTweetsById.data?.pages.flatMap((page) => page.tweets)}
          isLoading={getUserTweetsById.isLoading}
          hasError={getUserTweetsById.isError}
          hasMore={getUserTweetsById.hasNextPage}
          fetchNewTweets={getUserTweetsById.fetchNextPage}
        />
      </main>
    </>
  );
};

export default ProfilePage;

// Static pages to generate
export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [], // meaning that does not generate any page by default
    fallback: "blocking", // meaning only sending the page to the client once it is generated
  };
};

// For static site generation
export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  const id = context.params?.id;

  if (!id) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  // server side generation util from tRPC
  // allows to prefetch some data automatically to later render to the page
  const ssg = ssgUtil();
  await ssg.profile.getById.prefetch({ id }); // prefetch the data

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
}
