export const scrollToMessage = (
  messageId: number,
  behavior: ScrollBehavior = "smooth",
) => {
  if (!messageId) return;
  const el = document.getElementById(`msg-${messageId}`);

  if (el) {
    el.scrollIntoView({ behavior, block: "start" });
  }
};
