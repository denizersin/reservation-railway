import { TToast } from "@/hooks/use-toast";
import {
  defaultShouldDehydrateQuery,
  MutationCache,
  QueryCache,
  QueryClient
} from "@tanstack/react-query";
import SuperJSON from "superjson";




export const createQueryClient = ({ toast }: { toast?: TToast }) =>
  new QueryClient({
    queryCache: new QueryCache({
      onSuccess(...props) {
        console.log(props, 'onSuccess query')
      },

    }),
    mutationCache: new MutationCache({
      onSuccess(...props) {
        console.log(props, 'onSuccess mutation')
      },
      onError(error, variables, context, mutation) {
        console.log(error.name, 'error name')
        console.log(error.message, 'error message')
        if (error.message) {
          toast?.({
            title: error.message, variant: 'destructive',
            description: 'asd'
          })
        }
      },
    }),

    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: Infinity,
        retry: false,
      },
      mutations: {

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
