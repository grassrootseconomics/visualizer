import SarafuNetworkGraph from "@components/force-graph/force-graph";
import { PrismaClient } from "@prisma/client";
import { getNodesAndLinks } from "@utils/render_graph";
import { InferGetStaticPropsType } from "next";

const faucets = [
  "cd9fd1e71f684cfb30fa34831ed7ed59f6f77469",
  "289defd53e2d96f05ba29ebbebd9806c94d04cb6", // SARAFU MIGRATOR1
  "59a5e2faf8163fe24ca006a221dd0f34c5e0cb41", // SARAFU MIGRATOR2
  "ca5da01b6dac771c8f3625aa1a8931e7dac41832", // TOKEN DEPLOYER
  "65644d61fb9348a20ca0d89bb42d8152c82081b9", // SARAFU FAUCET
  "bbb4a93c8dcd82465b73a143f00fed4af7492a27", // SARAFU SINK
];
// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export const getStaticProps = async () => {
  const prisma = new PrismaClient();
  const tokensP = prisma.tokens.findMany();
  const transactionsP = prisma.transactions.findMany({
    where: {
      success: true,
      AND: [
        {
          sender_address: {
            notIn: faucets,
          },
        },
        {
          recipient_address: {
            notIn: faucets,
          },
        },
      ],
    },
    select: {
      tx_hash: true,
      sender_address: true,
      recipient_address: true,
      tx_value: true,
      token_address: true,
    },
  });
  const [tokens, transactions] = await Promise.all([tokensP, transactionsP]);
  const nodes_links = getNodesAndLinks(tokens, transactions);

  return {
    props: {
      nodes_links,
      tokens,
    },
    revalidate: 60 * 60 * 6, // In seconds
  };
};
function Dashboard(props: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="w-screen h-[90vh] overflow-hidden my-auto">
      {props.nodes_links && <SarafuNetworkGraph data={props.nodes_links} />}
    </div>
  );
}

export default Dashboard;
