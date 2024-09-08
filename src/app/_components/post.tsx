"use client";
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";

import { api } from "@/server/trpc/react";
import useAuth from "../providers/AuthProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { TRPC_ERROR_CODE_NUMBER } from '@trpc/server/unstable-core-do-not-import';

export function LatestPost() {

  const queryCLient = useQueryClient();
  const router = useRouter()

  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  useEffect(() => {
    api.post.getLatest
    return () => {
      
    };
  }, []);

  const createPost = api.post.create.useMutation({
    onSuccess: async (data) => {
      await utils.post.invalidate();
      setName("");
    },
  });


  const {}=useMutation({
    
  })
  

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const { mutate: loginMutate, data: loginData, isPending: isPendingLoading,error } = api.user.login.useMutation({
    onSuccess: async (data,) => {
      setEmail("");
      setPassword("");
      localStorage.setItem("token", data.token ?? "");
      queryCLient.invalidateQueries({
        queryKey: [getQueryKey(api.user.getSession)]
      })
    },
  });

  console.log(((error?.data??"")),'err-data');
  console.log(((error?.message??"")),'err-message');
  console.log(error?.shape,'err-shape');

  

  const { mutate: registerMutate, data: registerData, isPending: isPendingRegister } = api.user.register.useMutation({
    onSuccess: async (data) => {
      setEmail("");
      setPassword("");
      console.log(registerData,'registerData');
      localStorage.setItem("token", data.token ?? "");
      queryCLient.invalidateQueries({
        queryKey: [getQueryKey(api.user.getSession)]
      })

    },
  });




  const { isAuthenticated } = useAuth();



  useEffect(() => {
    if (!isAuthenticated) return

    router.push('/home')

  }, [isAuthenticated]);


  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ name });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>

      <form>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <button

          onClick={(e) => {
            e.preventDefault()
            loginMutate({ email, password })
          }}
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Login"}
        </button>

        <button

          onClick={(e) => {
            e.preventDefault()

            registerMutate({ email, password, name: "ersin" })
          }}

          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Register"}
        </button>
      </form>

    </div>
  );
}
