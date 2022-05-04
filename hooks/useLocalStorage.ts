import { useEffect, useState } from "react";
import { Token } from "./useWeb3";

export function getStorageValue(key: string, defaultValue) {
  // getting stored value
  const saved = localStorage.getItem(key);
  const initial = JSON.parse(saved);
  if (initial) {
    return initial;
  } else {
    localStorage.setItem(key, defaultValue);
    return defaultValue;
  }
}
// TODO Integrate with IPFS
export async function getToken(
  address: string,
  fetcher: (address: string) => Promise<Token>
): Promise<Token | null> {
  // getting stored value
  const saved = localStorage.getItem(address);
  const initial = JSON.parse(saved);
  if (initial) {
    return initial;
  } else {
    const token = await fetcher(address);
    localStorage.setItem(address, JSON.stringify(token));
    return token;
  }
}
export function getSyncToken(address: string): Token | null {
  // getting stored value
  const saved = localStorage.getItem(address);
  const initial = JSON.parse(saved);
  return initial;
}
export function getLastBlock(fetcher: () => Promise<number>): number | null {
  // getting stored value
  const saved = localStorage.getItem("lastBlock");
  const initial = parseInt(saved);
  if (initial) {
    return initial;
  } else {
    fetcher().then((blockNo) => {
      localStorage.setItem("lastBlock", blockNo.toString());
    });
    return null;
  }
}
export const useLocalStorage = (key: string, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // storing input name
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
