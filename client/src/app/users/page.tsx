"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useUsersList, useDeleteUser } from "@/hooks/use-users";
import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";

export default function UsersPage() {
  const { user } = useAuth();
  const { data: users = [] } = useUsersList();
  const deleteUser = useDeleteUser();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    await deleteUser.mutateAsync(deleteTargetId);
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  let userRows;
  if (users.length === 0) {
    userRows = (
      <tr><td colSpan={5} className="empty-state">No users yet</td></tr>
    );
  } else {
    userRows = users.map((listedUser: any) => {
      const displayEmail = listedUser.email ? listedUser.email : "-";
      const viewOnlyLabel = listedUser.view_only ? "Yes" : "No";

      return (
        <tr key={listedUser.id}>
          <td>{listedUser.username}</td>
          <td>{displayEmail}</td>
          <td><span className={`badge badge-${listedUser.role}`}>{listedUser.role}</span></td>
          <td>{viewOnlyLabel}</td>
          <td className="text-right">
            <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
              {user?.view_only ? null : <Link href={`/users/${listedUser.id}`} className="btn btn-sm btn-primary" aria-label="Edit user"><Pencil size={14} /></Link>}
              {user?.view_only ? null : <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(listedUser.id)} aria-label="Delete user"><Trash2 size={14} /></button>}
            </div>
          </td>
        </tr>
      );
    });
  }

  return (
    <>
      <div className="page-header">
        <h2>Users</h2>
        {user?.view_only ? null : <Link href="/users/new" className="btn btn-primary"><Plus size={16} /> New User</Link>}
      </div>
      <div className="table-wrapper"><table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>View Only</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {userRows}
        </tbody>
      </table></div>
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}
