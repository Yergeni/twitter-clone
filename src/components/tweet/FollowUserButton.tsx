import { useSession } from "next-auth/react";

import Button from "../ui/Button";

type FollowUserButtonProps = {
  isFollowing: boolean;
  userId: string;
  isLoading: boolean
  onClick: () => void;
};

export default function FollowUserButton({
  isFollowing,
  userId,
  isLoading,
  onClick,
}: FollowUserButtonProps) {
  const session = useSession();

  // avoid follow themselves
  if (session.status === "unauthenticated" || session.data?.user.id === userId)
    return null;

  return (
    <Button disabled={isLoading} onClick={onClick} small color={isFollowing ? "gray" : undefined}>
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
