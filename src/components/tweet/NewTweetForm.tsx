import {
  FormEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";

import Button from "../ui/Button";
import ProfileImage from "../ui/ProfileImage";

import { SerializedTweet } from "~/common/types";

/* Server */
import { api } from "~/utils/api";
import PagesManifestPlugin from "next/dist/build/webpack/plugins/pages-manifest-plugin";

/**
 * Modifies the height of a passed text area element
 */
function updateTextAreaHeight(textArea?: HTMLTextAreaElement) {
  if (!textArea) return;
  textArea.style.height = "0";
  textArea.style.height = `${textArea.scrollHeight}px`;
}

export default function NewTweetForm() {
  const session = useSession();
  if (session.status !== "authenticated") return null;

  return <TweetForm />;
}

// Trick to avoid warning for useLayoutEffect hook on the server side
function TweetForm() {
  const session = useSession();
  const user = session.data?.user;

  const [tweetValue, setTweetValue] = useState("");

  // --------- To set the textarea auto-height ---------
  // the callback is used to calculated the heigth on the initial render
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const inputRef = useCallback((textAreaInput: HTMLTextAreaElement) => {
    updateTextAreaHeight(textAreaInput);
    textAreaRef.current = textAreaInput;
  }, []);

  useLayoutEffect(() => {
    updateTextAreaHeight(textAreaRef.current);
  }, [tweetValue]);
  // --------- To set the textarea auto-height ---------

  // Handle create tweet
  const trpcUtils = api.useContext();
  type SetInfiniteDataType =
    typeof trpcUtils.tweet.infiniteTweets.setInfiniteData;
  const createTweetMutation = api.tweet.create.useMutation({
    onSuccess: (newTweet) => {
      setTweetValue("");
      const createData: Parameters<SetInfiniteDataType>[1] = (cachedData) => {
        if (!cachedData || !cachedData.pages[0]) return;

        if (session.status !== "authenticated") return;

        const newSerializedTweet: SerializedTweet = {
          ...newTweet,
          likesCount: 0,
          likedByMe: false,
          user: {
            id: session.data.user.id,
            name: session.data.user.name,
            image: session.data.user.image,
          },
        };

        return {
          ...cachedData,
          pages: [
            {
              ...cachedData.pages[0],
              tweets: [newSerializedTweet, ...cachedData.pages[0].tweets],
            },
            ...cachedData.pages.slice(1),
          ],
        };
      };
      
      trpcUtils.tweet.infiniteTweets.setInfiniteData({}, createData);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    createTweetMutation.mutate({ content: tweetValue });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-y px-4 py-2"
    >
      <div className="flex gap-4">
        <ProfileImage src={user?.image} />
        <textarea
          ref={inputRef}
          // remove the height to calculated it based on input
          style={{ height: 0 }}
          value={tweetValue}
          onChange={(e) => setTweetValue(e.target.value)}
          className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
          placeholder="What's on your mind?"
          autoFocus
        />
      </div>
      <Button className="self-end">Tweet</Button>
    </form>
  );
}
