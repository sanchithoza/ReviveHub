"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useCustomersList, useDeleteCustomer } from "@/hooks/use-customers";
import ConfirmModal from "@/components/ConfirmModal";

export default function CustomersPage() {
  const { data: customers = [] } = useCustomersList();
  const deleteCustomer = useDeleteCustomer();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    await deleteCustomer.mutateAsync(deleteTargetId);
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  let customerRows;
  if (customers.length === 0) {
    customerRows = (
      <tr><td colSpan={4} className="empty-state">No customers yet</td></tr>
    );
  } else {
    customerRows = customers.map((customer: any) => {
      const displayEmail = customer.email ? customer.email : "-";
      const displayPhone = customer.phone ? customer.phone : "-";

      return (
        <tr key={customer.id}>
          <td>{customer.name}</td>
          <td>{displayEmail}</td>
          <td>{displayPhone}</td>
          <td className="text-right">
            <div className="flex gap-1" style={{ justifyContent: "flex-end" }}><Link href={`/customers/${customer.id}`} className="btn btn-sm btn-primary" aria-label="Edit customer"><Pencil size={14} /></Link>
            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(customer.id)} aria-label="Delete customer"><Trash2 size={14} /></button></div>
          </td>
        </tr>
      );
    });
  }

  return (
    <>
      <div className="page-header">
        <h2>Customers</h2>
        <Link href="/customers/new" className="btn btn-primary"><Plus size={16} /> New Customer</Link>
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
          {customerRows}
        </tbody>
      </table></div>
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}
