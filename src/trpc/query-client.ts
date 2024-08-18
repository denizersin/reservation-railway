import {
  defaultShouldDehydrateQuery,
  QueryClient,
  QueryClientConfig,
} from "@tanstack/react-query";
import { headers } from "next/headers";
import SuperJSON from "superjson";


function getToken() {
  if (localStorage === undefined) {
    return null
  }
  return localStorage?.getItem?.("token")
}

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: Infinity,
        retry: false,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },

    },
  });
