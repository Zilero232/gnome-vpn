export type AdminNavigation = {
  userId: string | null;
  openUser: (userId: string) => void;
  closeUser: () => void;
};
