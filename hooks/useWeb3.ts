import { ERC20 } from "contracts/ERC20";
import { getToken } from "hooks/useLocalStorage";
import React from "react";
import Web3 from "web3";
import { TokenUniqueSymbolJSON } from "../contracts/TokenUniqueSymbol";

const web3 = new Web3("https://rpc.sarafu.network");

export type Token = {
  address: string;
  symbol: string;
  decimals: number;
};
export const useWeb3 = (): [
  Web3,
  number,
  Map<String, Token>,
  (address: string) => Promise<Token>
] => {
  const [tokens, setTokens] = React.useState<Map<String, Token>>(
    new Map<String, Token>()
  );
  const [currentBlock, setCurrentBlock] = React.useState<number>();

  const setup = async () => {
    const no = await web3.eth.getBlockNumber();
    const tokens = await refreshTokens();
    setTokens(tokens);
    setCurrentBlock(no);
  };
  const refreshTokens = async () => {
    const tus = new web3.eth.Contract(
      TokenUniqueSymbolJSON,
      "0x5A1EB529438D8b3cA943A45a48744f4c73d1f098"
    );

    const entryCount = await tus.methods.entryCount().call();
    const tokens: Map<string, Token> = new Map();
    for (let i = 0; i < entryCount; i++) {
      const address = await tus.methods.entry(i).call();
      const token = await getToken(address, fetchToken);
      if (token) {
        tokens.set(address, token);
      }
    }
    return tokens;
  };
  const fetchToken = async (address: string): Promise<Token> => {
    const tokenContract = new web3.eth.Contract(ERC20, address);
    const symbol = await tokenContract.methods.symbol().call();
    const decimals = await tokenContract.methods.decimals().call();
    const token = {
      address,
      symbol,
      decimals,
    };
    setTokens(tokens.set(address, token));
    return token;
  };
  React.useEffect(() => {
    setup();
  }, []);
  return [web3, currentBlock, tokens, fetchToken];
};
