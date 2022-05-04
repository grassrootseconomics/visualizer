export const cacheUrl = "https://cache.sarafu.network/txa";
export const getCacheUrl = (address: string, limit = 16000, offset = 0) => {
  let url = cacheUrl;
  url = url + `/user/${address}/${limit}/${offset}`;
  return url;
};

export const getAllCacheUrl = ({ limit, offset, blockOffset }) => {
  let url = cacheUrl;
  if (limit) {
    url = url + `/${limit}`;
  } else {
    return url;
  }
  if (offset != null) {
    url = url + `/${offset}`;
  } else {
    return url;
  }
  if (blockOffset) {
    url = url + `/${blockOffset}`;
  } else {
    return url;
  }
  return url;
};
