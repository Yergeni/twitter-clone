import { useSession } from "next-auth/react";

import { VscHeartFilled, VscHeart } from "react-icons/vsc";

import IconHoverEffect from "../ui/IconHoverEffect";

type HeartLikeButtonProps = {
  likeByMe: boolean;
  likesCount: number;
  onClick: () => void;
  isLoading: boolean;
};

export default function HeartLikeButton({
  likeByMe,
  likesCount,
  onClick,
  isLoading,
}: HeartLikeButtonProps) {
  const session = useSession();
  const HeartIcon = likeByMe ? VscHeartFilled : VscHeart;

  if (session.status !== "authenticated") {
    return (
      <div className="my-1 flex items-center gap-3 self-start text-gray-500">
        <HeartIcon />
        <span>{likesCount}</span>
      </div>
    );
  } else {
    return (
      <button
        disabled={isLoading}
        onClick={onClick}
        className={`group -ml-2 flex items-center gap-1 self-start transition-colors duration-200 ${
          likeByMe
            ? "text-red-500"
            : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"
        }`}
      >
        <IconHoverEffect color="red">
          <HeartIcon
            className={`transition-colors duration-200 ${
              likeByMe
                ? "fill-red-500"
                : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"
            }`}
          />
        </IconHoverEffect>
        <span>{likesCount}</span>
      </button>
    );
  }
}
