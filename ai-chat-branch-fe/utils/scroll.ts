export const scrollToMessage = (
  messageId: string,
  behavior: ScrollBehavior = "smooth"
) => {
  if (!messageId) return;
  const el = document.getElementById(`msg-${messageId}`);

  if (el) {
    el.scrollIntoView({ behavior, block: "start" });
  }
};
