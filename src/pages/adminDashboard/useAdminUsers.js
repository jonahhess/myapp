import { useCallback, useMemo, useState } from "react";
import useAsyncListResource from "../../hooks/useAsyncListResource";
import useAsyncMutation from "../../hooks/useAsyncMutation";
import usePagedCollection from "../../hooks/usePagedCollection";
import usersService from "../../services/usersService";
import {
  normalizeUserRow,
  readUsersPayload,
  USERS_PER_PAGE,
} from "./adminUsersUtils";

export default function useAdminUsers() {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const { isPending: isDeletingUser, run: runDeleteUser } = useAsyncMutation({
    defaultErrorMessage: "Failed to delete user.",
  });

  const mapUserItems = useCallback(
    (payload) => readUsersPayload(payload).map(normalizeUserRow),
    [],
  );

  const {
    items: users,
    setItems: setUsers,
    isLoading,
    errorMessage,
    setErrorMessage,
  } = useAsyncListResource({
    fetcher: usersService.getUsers,
    mapItems: mapUserItems,
    errorMessage: "Failed to load users.",
    clearItemsOnError: false,
  });

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return users;
    }

    return users.filter((item) => {
      const fullName = item.fullName.toLowerCase();
      const email = item.email.toLowerCase();
      const phone = String(item.phone || "").toLowerCase();

      return (
        fullName.includes(normalizedQuery) ||
        email.includes(normalizedQuery) ||
        phone.includes(normalizedQuery)
      );
    });
  }, [query, users]);
  const {
    totalCount: filteredUsersCount,
    totalPages,
    safeCurrentPage,
    pageItems: pageUsers,
  } = usePagedCollection({
    items: filteredUsers,
    currentPage,
    pageSize: USERS_PER_PAGE,
  });

  const handleQueryChange = (nextQuery) => {
    setQuery(nextQuery);
    setCurrentPage(1);
  };

  const handleDeleteRequest = (targetUser) => {
    if (!targetUser || targetUser.isAdmin || isDeletingUser) {
      return;
    }

    setPendingDeleteUser(targetUser);
  };

  const handleDeleteCancel = () => {
    if (isDeletingUser) {
      return;
    }

    setPendingDeleteUser(null);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteUser?.id || isDeletingUser) {
      return;
    }

    setErrorMessage("");
    const targetUser = pendingDeleteUser;

    try {
      await runDeleteUser(() => usersService.deleteUserById(targetUser.id), {
        onSuccess: () => {
          setUsers((prevUsers) =>
            prevUsers.filter((entry) => entry.id !== targetUser.id),
          );
          setSuccessMessage(`Deleted ${targetUser.fullName} successfully.`);
          setPendingDeleteUser(null);
        },
        onError: (_, message) => {
          setErrorMessage(message);
        },
      });
    } catch {
      // Error state is handled in onError.
    }
  };

  return {
    query,
    currentPage,
    isLoading,
    isDeletingUser,
    pendingDeleteUser,
    errorMessage,
    successMessage,
    filteredUsersCount,
    pageUsers,
    totalPages,
    safeCurrentPage,
    setCurrentPage,
    handleQueryChange,
    handleDeleteRequest,
    handleDeleteCancel,
    handleDeleteConfirm,
  };
}
