import SuperJSON from "superjson";
import { appRouter } from "../root";
import { createInnerTRPCContext } from "../trpc";
import { createServerSideHelpers } from "@trpc/react-query/server";

/**
 * Allows to prefetch some data automatically to render to the page
 * generates static site 
 * @returns
 */
export function ssgUtil() {
  return createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null, revalidateSSG: null }),
    transformer: SuperJSON,
  });
}
