import { useState } from "react";
import { CiChat2, CiSearch } from "react-icons/ci";
import { HiMenuAlt2 } from "react-icons/hi";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { IoCloseOutline } from "react-icons/io5";

interface IProps {
  conversations: Array<any>;
  isMobile: boolean;
  onCloseOnMobile?: () => void;
}

const Menu: React.FC<IProps> = ({
  conversations,
  isMobile,
  onCloseOnMobile,
}) => {
  const router = useRouter();
  const { id } = router.query || {};
  const [isScrolled, setIsScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const scrollTop = e.currentTarget.scrollTop;

    setIsScrolled(scrollTop > 0);
  };

  const actionClassNames =
    "dark:bg-[#181818] flex items-center text-sm mx-1.5 py-1.5 px-2.5 min-h-9 rounded-[10px] hover:bg-gray-200 dark:hover:bg-[#ffffff1a]";

  const renderTopLeftIcon = () => {
    if (isMobile) {
      return (
        <button
          className="p-2 rounded-lg cursor-w-resize"
          type="button"
          onClick={onCloseOnMobile}
        >
          <IoCloseOutline className="w-4.5 h-4.5" />
        </button>
      );
    }

    if (!isMobile && isExpanded) {
      return (
        <button
          className="p-2 rounded-lg cursor-w-resize"
          type="button"
          onClick={() => {
            setIsExpanded(false);
          }}
        >
          <HiMenuAlt2 className="w-4.5 h-4.5" />
        </button>
      );
    }

    return null;
  };

  return (
    <div
      className={`dark:bg-[#181818] dark:border-[#181818] ${isMobile ? "block" : "hidden"} sm:block relative h-full shrink-0 overflow-hidden border-e border-gray-200 bg-gray-50 transition-width duration-200 ease-in-out ${isExpanded ? "w-[260px]" : "w-13"}`}
    >
      <div className="relative flex h-full flex-col">
        <nav
          className="relative flex h-full w-full flex-1 flex-col overflow-y-auto transition-opacity duration-500"
          onScroll={handleScroll}
        >
          <div
            className={`dark:bg-[#181818] sticky top-0 z-30 bg-gray-50 transition-shadow duration-200 ${
              isScrolled ? "shadow-md" : "shadow-none"
            }`}
          >
            <div className="touch:px-1.5 px-2">
              <div
                className={`flex items-center ${isExpanded ? "justify-between" : "justify-center"} h-13`}
              >
                <div className="pl-1 rounded-lg p-1 transition-all duration-200">
                  {isExpanded ? (
                    <Link href="/" style={{ opacity: isExpanded ? 1 : 0 }}>
                      <Image
                        alt="Picture of the Chat bot"
                        height={30}
                        src="/avatar.svg"
                        width={30}
                      />
                    </Link>
                  ) : (
                    <button
                      className="cursor-e-resize"
                      type="button"
                      onClick={() => {
                        setIsExpanded(true);
                      }}
                    >
                      <HiMenuAlt2 className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>
                {renderTopLeftIcon()}
              </div>
            </div>
          </div>
          <div
            className={`dark:bg-[#181818] sticky top-13 z-30 bg-gray-50 transition-shadow duration-200 ${
              isScrolled ? "shadow-md" : "shadow-none"
            }`}
          >
            <aside className="py-2 flex flex-col">
              <a className={actionClassNames} href="/">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <CiChat2 className="w-4.5 h-4.5 flex-shrink-0" />
                  {isExpanded ? (
                    <span className="truncate">New Chat</span>
                  ) : null}
                </div>
              </a>
              <a className={actionClassNames} href="/">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <CiSearch className="w-4.5 h-4.5 flex-shrink-0" />
                  {isExpanded ? (
                    <span className="truncate">Search Chat</span>
                  ) : null}
                </div>
              </a>
            </aside>
          </div>
          {isExpanded ? (
            <aside className="flex flex-col py-2.5">
              <h2 className="block text-sm text-[#8f8f8f] font-normal mx-1.5 my-0 py-2 px-2.5 truncate">
                Chats
              </h2>
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  className={`flex items-center text-sm mx-1.5 min-h-9 py-1.5 
                  px-2.5 rounded-[10px] hover:bg-gray-200 dark:hover:bg-[#ffffff1a] active:opacity-70 
                  ${Number(id) === conv.id ? "bg-gray-200 dark:bg-[#ffffff1a]" : ""}`}
                  href={`/chat/${conv.id}`}
                  onClick={isMobile ? onCloseOnMobile : undefined}
                >
                  <span className="truncate">{conv.name}</span>
                </Link>
              ))}
            </aside>
          ) : null}
        </nav>
      </div>
    </div>
  );
};

export default Menu;
