import { Select } from "@components/select";
import { getAllCacheUrl, getCacheUrl } from "@utils/cache";
import { getSyncToken } from "hooks/useLocalStorage";
import { Token, useWeb3 } from "hooks/useWeb3";
import { Transaction } from "models/Transaction";
import { useRouter } from "next/router";
import React from "react";
const AllTokensFilterItem: Token = {
  address: "all",
  symbol: "ALL",
  decimals: 0,
};
function Transactions({ query }) {
  const router = useRouter();
  const [address, setAddress] = React.useState<string>(query?.address as string);
  const [limit, setLimit] = React.useState<number>(1000);
  const [offset, setOffset] = React.useState<number>(0);
  const [blockOffset, setBlockOffset] = React.useState<number>();
  const [tokenFilter, setTokenFilter] =
    React.useState<Token>(AllTokensFilterItem);

  const [web3, currentBlock, tokens] = useWeb3();
  React.useEffect(() => {
    console.log(currentBlock);
    if (currentBlock !== 0) {
      setBlockOffset(currentBlock - 10000);
      // TODO Remove this hack
      fetchTransactions(currentBlock - 10000);
    }
  }, [currentBlock, query?.address]);

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = React.useState<
    Transaction[]
  >([]);
  React.useEffect(() => {
    setFilteredTransactions(
      transactions.filter((t) => {
        if (tokenFilter.address === AllTokensFilterItem.address) {
          return true;
        } else {
          if (`0x${t.source_token}` === tokenFilter.address) {
            return true;
          }
        }
      })
    );
  }, [tokenFilter, transactions]);
  const fetchTransactions = async (blockOffsetI?: number) => {
    let url;
    if (address) {
      const valid = web3.utils.isAddress(address);
      const checksumAddress = web3.utils.toChecksumAddress(address);

      if (!valid) {
        alert("Address is not valid");
        return;
      }
      router.push(`/transactions?address=${checksumAddress}`, undefined, {
        shallow: true,
      });
      url = getCacheUrl(checksumAddress, limit, offset);
    } else {
      url = getAllCacheUrl({
        blockOffset: blockOffsetI ?? blockOffset,
        limit: limit,
        offset: offset,
      });
    }
    console.info(`Getting Transactions from: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    setTransactions(
      (data.data as Transaction[]).sort(
        (a, b) => b.block_number - a.block_number
      )
    );
  };
  const buildTransactions = (
    <table className="table-auto w-full">
      <thead>
        <tr>
          <th className="text-left">Block #</th>
          <th className="text-left">Date</th>
          <th className="text-left">Time</th>
          <th className="text-left">From</th>
          <th className="text-left">To</th>
          <th className="text-left">Amount</th>
          <th className="text-left">Voucher</th>
          <th className="text-center">Success</th>
        </tr>
      </thead>
      <tbody>
        {filteredTransactions.map((tx) => {
          const token = getSyncToken(`0x${tx.source_token}`);
          const blockDate = new Date(tx.date_block * 1000);
          return (
            <tr key={tx.tx_hash}>
              <td>{tx.block_number}</td>
              <td>{blockDate.toLocaleDateString()}</td>
              <td>{blockDate.toLocaleTimeString()}</td>
              <td>{tx.sender.toLowerCase()}</td>
              <td>{tx.recipient.toLowerCase()}</td>
              <td>{tx.to_value / 10 ** (token?.decimals ?? 6)}</td>
              <td>{token?.symbol ?? tx.source_token.toLowerCase()}</td>
              <td className="text-center">{tx.success ? "✅" : "❌"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const tokensToSelect = [...tokens.values()];
  tokensToSelect.push(AllTokensFilterItem);
  // TODO Break this out to Inputs/Filter
  const buildInputs = (
    <div className="flex">
      <input
        aria-label="Blockchain Address"
        placeholder="Blockchain Address (0xdeadbeef)"
        className="w-1/2 p-2 m-4 border rounded-md dark:text-gray-600"
        onChange={(e) => setAddress(e.target.value)}
        value={address}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            // Cancel the default action, if needed
            e.preventDefault();
            fetchTransactions();
          }
        }}
      />
      <Select
        label="Tokens"
        value={tokenFilter}
        onChange={(e) => setTokenFilter(e)}
        itemToLabel={(v) => v.symbol}
        itemToValue={(v) => v.address}
        items={tokensToSelect}
      />
      <input
        placeholder="Limit"
        className="w-1/12 p-2 m-4 border rounded-md dark:text-gray-600"
        onChange={(e) => setLimit(parseInt(e.target.value))}
        value={limit}
        type="number"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            // Cancel the default action, if needed
            e.preventDefault();
            fetchTransactions();
          }
        }}
      />
      <input
        placeholder="Offset"
        className="w-1/12 p-2 m-4 border rounded-md dark:text-gray-600"
        onChange={(e) => setOffset(parseInt(e.target.value))}
        value={offset}
        type="number"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            // Cancel the default action, if needed
            e.preventDefault();
            fetchTransactions();
          }
        }}
      />
      <input
        placeholder="Block Offset"
        className="w-2/12 p-2 m-4 border rounded-md dark:text-gray-600"
        onChange={(e) => {
          setBlockOffset(parseInt(e.target.value));
        }}
        value={blockOffset}
        type="number"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            // Cancel the default action, if needed
            e.preventDefault();
            fetchTransactions();
          }
        }}
      />
      <button
        className="bg-green-500  hover:bg-green-700 text-white font-bold button rounded pr-2 m-4 flex items-center justify-between"
        onClick={() => fetchTransactions()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mx-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        Search
      </button>
    </div>
  );
  return (
    <div className="container mx-auto sm:px-4 container-contact pb-5">
      <div className="flex justify-end">
        <div>
          <span className="text-gray-400">Current Block</span> {currentBlock}
        </div>
      </div>
      {buildInputs}
      <div className="p-4">{buildTransactions}</div>
    </div>
  );
}

Transactions.getInitialProps = async ({ query }) => {
  return { query };
};
export default Transactions;
