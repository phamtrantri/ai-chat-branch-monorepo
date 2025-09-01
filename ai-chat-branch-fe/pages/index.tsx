import type { InferGetServerSidePropsType, GetServerSideProps } from "next";

import DefaultLayout from "@/layouts/default";
import NewChat from "@/components/chat/new_chat";
import ChatHeader from "@/components/chat/chat_header";
import { getAllConversations } from "@/services";

interface IIndexProps {
  conversations: Array<any>;
}

export const getServerSideProps = (async () => {
  // Fetch data from external API
  const conversations = await getAllConversations();

  // Pass data to the page via props
  return { props: { conversations } };
}) satisfies GetServerSideProps<IIndexProps>;

export default function IndexPage({
  conversations,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <DefaultLayout conversations={conversations}>
      <div className="relative flex max-w-full h-full flex-1 flex-col">
        <ChatHeader conversations={conversations} />
        <NewChat />
      </div>
    </DefaultLayout>
  );
}
