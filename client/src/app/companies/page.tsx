"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { useCompaniesList, useDeleteCompany } from "@/hooks/use-companies";
import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";

export default function CompaniesPage() {
  const { user } = useAuth();
  const { data: companies = [] } = useCompaniesList();
  const deleteCompany = useDeleteCompany();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    await deleteCompany.mutateAsync(deleteTargetId);
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  let companyRows;
  if (companies.length === 0) {
    companyRows = (
      <tr><td colSpan={4} className="empty-state">No companies yet</td></tr>
    );
  } else {
    companyRows = companies.map((company: any) => {
      const displayEmail = company.email ? company.email : "-";
      const displayPhone = company.phone ? company.phone : "-";

      return (
        <tr key={company.id}>
          <td>{company.name}</td>
          <td>{displayEmail}</td>
          <td>{displayPhone}</td>
          <td className="text-right">
            <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
              {user?.view_only ? null : <Link href={`/companies/${company.id}`} className="btn btn-sm btn-primary" aria-label="Edit company"><Pencil size={14} /></Link>}
              {user?.view_only ? null : <button className="btn btn-sm btn-danger" onClick={() => handleDelete(company.id)} aria-label="Delete company"><Trash2 size={14} /></button>}
            </div>
          </td>
        </tr>
      );
    });
  }

  return (
    <>
      <div className="page-header">
        <h2>Companies</h2>
        {user?.view_only ? null : <Link href="/companies/new" className="btn btn-primary"><Plus size={16} /> New Company</Link>}
      </div>
      <div className="table-wrapper"><table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {companyRows}
        </tbody>
      </table></div>
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Company"
        message="Are you sure you want to delete this company? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}
