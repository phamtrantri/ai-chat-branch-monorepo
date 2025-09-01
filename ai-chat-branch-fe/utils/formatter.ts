export const formatBreadcrumItem = (name: string) => {
  return name.length < 30 ? name : name.substring(0, 30) + "...";
};
