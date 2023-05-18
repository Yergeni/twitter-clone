import Image from "next/image";

import { VscAccount } from "react-icons/vsc"

type ProfileImageProps = {
  src?: string | null;
  className?: string;
};

export default function ProfileImage({
  src,
  className = "",
}: ProfileImageProps) {

  return (
    <div
      className={`relative h-12 w-12 overflow-hidden rounded-full ${className}`}
    >
      {/* NOTE: 
        quality 100 means no donwgrade the quality
        fill means to fill the whole container 
        (container MUST have position: relative) 
      */}
      {src ? (
        <Image
          src={src}
          alt="Profile"
          quality={100}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : <VscAccount className="w-full h-full" />}
    </div>
  );
}
