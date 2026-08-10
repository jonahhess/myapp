import { useEffect, useMemo, useState } from "react";
import usersService from "../../services/usersService";
import { getUserFriendlyErrorMessage } from "../../utils/errors";
import {
  normalizeUserRow,
  readUsersPayload,
  USERS_PER_PAGE,
} from "./adminUsersUtils";

export default function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const payload = await usersService.getUsers();
        const nextUsers = readUsersPayload(payload).map(normalizeUserRow);
        if (isMounted) {
          setUsers(nextUsers);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            getUserFriendlyErrorMessage(error, "Failed to load users."),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

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
  const filteredUsersCount = filteredUsers.length;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsersCount / USERS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * USERS_PER_PAGE;
  const pageUsers = filteredUsers.slice(pageStart, pageStart + USERS_PER_PAGE);

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

    setIsDeletingUser(true);
    setErrorMessage("");

    try {
      await usersService.deleteUserById(pendingDeleteUser.id);
      setUsers((prevUsers) =>
        prevUsers.filter((entry) => entry.id !== pendingDeleteUser.id),
      );
      setSuccessMessage(`Deleted ${pendingDeleteUser.fullName} successfully.`);
      setPendingDeleteUser(null);
    } catch (error) {
      setErrorMessage(
        getUserFriendlyErrorMessage(error, "Failed to delete user."),
      );
    } finally {
      setIsDeletingUser(false);
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
