"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { httpLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import SuperJSON from "superjson";

import { TToast, useToast } from "@/hooks/use-toast";
import useClientLocalStorage from "@/hooks/useClientLocalStorage";
import { type AppRouter } from "@/server/api/root";
import { EnumHeader } from "@/shared/enums/predefined-enums";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = (toast: TToast) => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient({});
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= createQueryClient({toast}));
};

export const api = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {


  const { toast } = useToast()
  const queryClient = getQueryClient(toast);

  const localStorage = useClientLocalStorage()

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),

        // unstable_httpBatchStreamLink({
        //   transformer: SuperJSON,
        //   url: getBaseUrl() + "/api/trpc",
        //   headers: () => {
        //     const headers = new Headers();
        //     headers.set("x-trpc-source", "nextjs-react");
        //     headers.set("Authorization", `Bearer ${localStorage?.getItem("token")}`);
        //     return headers;
        //   },
        // }),
        httpLink({
          url: getBaseUrl() + "/api/trpc",
          transformer: SuperJSON,
          headers: () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            headers.set(EnumHeader.RESTAURANT_ID, localStorage?.getItem(EnumHeader.RESTAURANT_ID) ?? '')
            // headers.set("Authorization", `Bearer ${localStorage?.getItem("token")}`);
            return headers;
          },
        })
      ],
      
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
