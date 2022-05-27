import { getAllCacheUrl, getCacheUrl } from "@utils/cache";
import { Transaction } from "models/Transaction";
import React from "react";
import web3Utils from "web3-utils";
import { Token, useWeb3 } from "./useWeb3";

const AllTokensFilterItem: Token = {
  address: "all",
  symbol: "ALL",
  decimals: 0,
};
interface UseTransactionFilterOptions {
  address?: string;
  limit?: number;
  offset?: number;
  blockOffset?: number;
  tokenFilter?: Token;
}
const defaultFilterOptions: UseTransactionFilterOptions = {
  address: undefined,
  limit: 1000,
  offset: 0,
  blockOffset: undefined,
  tokenFilter: AllTokensFilterItem,
};
export const useTransactionFilter = (options: UseTransactionFilterOptions) => {
  const [web3, currentBlock, tokens] = useWeb3();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = React.useState<
    Transaction[]
  >([]);
  const [error, setError] = React.useState<string>();
  const [address, setAddress] = React.useState<string>(options?.address);
  const [limit, setLimit] = React.useState<number>(
    options.limit ?? defaultFilterOptions.limit
  );
  const [offset, setOffset] = React.useState<number>(
    options.offset ?? defaultFilterOptions.offset
  );
  const [blockOffset, setBlockOffset] = React.useState<number>(
    options.blockOffset ?? defaultFilterOptions.blockOffset
  );
  const [tokenFilter, setTokenFilter] = React.useState<Token>(
    options.tokenFilter ?? defaultFilterOptions.tokenFilter
  );
  React.useEffect(() => {
    if (currentBlock !== 0) {
      setBlockOffset(currentBlock - 10000);
    }
  }, [currentBlock]);

  React.useEffect(() => {
    fetchTransactions().then((transactions) => [setTransactions(transactions)]);
  }, []);

  React.useEffect(() => applyFilter(), [transactions, tokenFilter]);

  const fetchTransactions = async () => {
    let url;
    if (options.address) {
      const valid = web3Utils.isAddress(options.address);
      const checksumAddress = web3Utils.toChecksumAddress(options.address);
  
      if (!valid) {
        setError("Address is not valid");
        return;
      }
      url = getCacheUrl(checksumAddress, options.limit, options.offset);
    } else {
      url = getAllCacheUrl({
        blockOffset: options.blockOffset,
        limit: options.limit,
        offset: options.offset,
      });
    }
    console.info(`Getting Transactions from: ${url}`);
  
    const response = await fetch(url);
    const data = await response.json();
    return (data.data as Transaction[]).sort(
      (a, b) => b.block_number - a.block_number
    );
  };
  const applyFilter = () => {
    const filtered = transactions.filter((t) => {
      if (tokenFilter.address === AllTokensFilterItem.address) {
        return true;
      } else {
        if (`0x${t.source_token}` === tokenFilter.address) {
          return true;
        }
      }
    });
    setFilteredTransactions(filtered);
  };
  return {
    address,
    setAddress,
    limit,
    setLimit,
    offset,
    setOffset,
    blockOffset,
    setBlockOffset,
    tokenFilter,
    setTokenFilter,
    filteredTransactions,
  };
};


