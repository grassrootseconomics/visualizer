export const cacheUrl = "https://cache.sarafu.network/txa";
export const getCacheUrl = (address: string, limit = 16000, offset = 0) => {
  let url = cacheUrl;
  url = url + `/user/${address}/${limit}/${offset}`;
  return url;
};

export const getAllCacheUrl = (options?: {
  limit?: number;
  offset?: number;
  blockOffset?: number;
}): string => {
  let url = cacheUrl;
  if (options?.limit) {
    url = url + `/${options.limit}`;
  } else {
    return url;
  }
  if (options?.offset != null) {
    url = url + `/${options.offset}`;
  } else {
    return url;
  }
  if (options?.blockOffset) {
    url = url + `/${options?.blockOffset}`;
  } else {
    return url;
  }
  return url;
};
