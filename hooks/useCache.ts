import { getAllCacheUrl, getCacheUrl } from "@utils/cache";
import { Transaction } from "models/Transaction";
import useSWR from "swr";

interface UseCacheOptions {
  address?: string;
  limit?: number;
  offset?: number;
  blockOffset?: number;
}
export const fetcher = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data?.data;
};

export const useCache = (options: UseCacheOptions) => {
  let url: string;
  if (options.address) {
    url = getCacheUrl(options.address, options.limit, options.offset);
  } else {
    url = getAllCacheUrl(options);
  }
  const { data, error } = useSWR<Transaction[], string>(url, fetcher);
  return { data, error };
};
