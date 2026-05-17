"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useProductsList, useDeleteProduct } from "@/hooks/use-products";
import ConfirmModal from "@/components/ConfirmModal";

export default function ProductsPage() {
  const { data: products = [] } = useProductsList();
  const deleteProduct = useDeleteProduct();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    await deleteProduct.mutateAsync(deleteTargetId);
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  let productRows;
  if (products.length === 0) {
    productRows = (
      <tr><td colSpan={5} className="empty-state">No products yet</td></tr>
    );
  } else {
    productRows = products.map((product: any) => {
      const displayModel = product.model ? product.model : "-";
      const displayDescription = product.description ? product.description : "-";
      const displayCompany = product.company_name ? product.company_name : "-";

      return (
        <tr key={product.id}>
          <td>{product.name}</td>
          <td>{displayCompany}</td>
          <td>{displayModel}</td>
          <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayDescription}</td>
          <td className="text-right">
            <div className="flex gap-1" style={{ justifyContent: "flex-end" }}><Link href={`/products/${product.id}`} className="btn btn-sm btn-primary" aria-label="Edit product"><Pencil size={14} /></Link>
            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product.id)} aria-label="Delete product"><Trash2 size={14} /></button></div>
          </td>
        </tr>
      );
    });
  }

  return (
    <>
      <div className="page-header">
        <h2>Products</h2>
        <Link href="/products/new" className="btn btn-primary"><Plus size={16} /> New Product</Link>
      </div>
      <div className="table-wrapper"><table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Model</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {productRows}
        </tbody>
      </table></div>
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}
