import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import IconHoverEffect from "./ui/IconHoverEffect";
import { VscHome, VscAccount, VscSignOut, VscSignIn } from "react-icons/vsc";
import { PROFILE_PATH } from "~/common/constants";

function SideNav() {
  const session = useSession();
  const user = session.data?.user;

  return (
    <nav className="sticky top-0 px-2 py-4">
      <ul className="flex flex-col items-start gap-2 whitespace-nowrap">
        <li>
          <Link href="/">
            <IconHoverEffect>
              <span className="flex items-center gap-4">
                <VscHome className="h-6 w-6" />
                <span className="hidden text-lg md:inline">Home</span>
              </span>
            </IconHoverEffect>
          </Link>
        </li>
        {user && (
          <li>
            <Link href={`${PROFILE_PATH}/${user.id}`}>
              <IconHoverEffect>
                <span className="flex items-center gap-4">
                  <VscAccount className="h-6 w-6" />
                  <span className="hidden text-lg md:inline">Profile</span>
                </span>
              </IconHoverEffect>
            </Link>
          </li>
        )}
        {user ? (
          <li>
            {/* eslint-disable-next-line */}
            <button onClick={() => void signOut()}>
              <IconHoverEffect>
                <span className="flex items-center gap-4">
                  <VscSignOut className="h-6 w-6 fill-red-700" />
                  <span className="hidden fill-red-700 text-lg md:inline">
                    Log Out
                  </span>
                </span>
              </IconHoverEffect>
            </button>
          </li>
        ) : (
          <li>
            {/* eslint-disable-next-line */}
            <button onClick={() => signIn()}>
              <IconHoverEffect>
                <span className="flex items-center gap-4">
                  <VscSignIn className="h-6 w-6 fill-green-700" />
                  <span className="hidden fill-green-700 text-lg md:inline">
                    Log In
                  </span>
                </span>
              </IconHoverEffect>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default SideNav;
