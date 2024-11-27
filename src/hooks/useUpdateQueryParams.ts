"use client"
import { useRouter, useSearchParams } from "next/navigation";

export const useUpdateQueryParams = (props: { replace?: boolean }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (newParams: Record<string, string | number | boolean | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }
    });

    Array.from(current.entries()).forEach(([key, value]) => {
      if (value === '') {
        current.delete(key);
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : '';

    if (props.replace) {
      router.replace(`${window.location.pathname}${query}`);
    } else {
      router.push(`${window.location.pathname}${query}`);
    }
  };
};
