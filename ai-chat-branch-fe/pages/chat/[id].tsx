import type { InferGetServerSidePropsType, GetServerSideProps } from "next";

import Chat from "@/components/chat/chat";
import ChatHeader from "@/components/chat/chat_header";
import DefaultLayout from "@/layouts/default";
import { getAllConversations, getConversationDetails } from "@/services";

interface IProps {
  conversations: Array<any>;
  history: Array<any>;
}

export const getServerSideProps = (async ({ params }) => {
  // Fetch data from external API
  const [conversations, history] = await Promise.all([
    getAllConversations(),
    getConversationDetails(Number(params?.id)),
  ]);

  // Pass data to the page via props
  return { props: { conversations, history } };
}) satisfies GetServerSideProps<IProps>;

export default function ChatPage({
  conversations,
  history,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <DefaultLayout conversations={conversations}>
      <div className="relative flex max-w-full h-full flex-1 flex-col">
        <ChatHeader conversations={conversations} path={history.path} />
        <Chat history={history.messages} />
      </div>
    </DefaultLayout>
  );
}
