import { AppRouter } from "@/server/api/root";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;
type RouterInput = inferRouterInputs<AppRouter>;
