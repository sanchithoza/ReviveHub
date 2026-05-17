"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import { useCompaniesList } from "@/hooks/use-companies";
import { useCreateProduct } from "@/hooks/use-products";
import ConfirmModal from "@/components/ConfirmModal";
import SearchableSelect from "@/components/SearchableSelect";

export default function NewProductPage() {
  const router = useRouter();
  const { data: companies = [] } = useCompaniesList();
  const createProduct = useCreateProduct();
  const [form, setForm] = useState({ name: "", model: "", description: "", company_id: "" });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const updateField = (field: string) => {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm({ ...form, [field]: event.target.value });
    };
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmCreate = async () => {
    await createProduct.mutateAsync({
      name: form.name,
      company_id: Number(form.company_id),
      model: form.model || undefined,
      description: form.description || undefined,
    });
    setShowConfirmModal(false);
    router.push("/products");
  };

  const companyOptions = companies.map((company: any) => ({
    value: String(company.id),
    label: company.name,
  }));

  return (
    <>
      <div className="page-header">
        <h2>New Product</h2>
      </div>
      <div className="card max-w-sm">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input required value={form.name} onChange={updateField("name")} />
          </div>
          <div className="form-group">
            <label>Company *</label>
            <SearchableSelect
              options={companyOptions}
              value={form.company_id}
              onChange={(value: string) => setForm({ ...form, company_id: value })}
              placeholder="Search company..."
              required
            />
          </div>
          <div className="form-group">
            <label>Model</label>
            <input value={form.model} onChange={updateField("model")} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={updateField("description")} />
          </div>
          <div className="flex gap-1">
            <button type="submit" className="btn btn-primary"><Save size={16} /> Create</button>
            <button type="button" className="btn" onClick={() => router.push("/products")}><X size={16} /> Cancel</button>
          </div>
        </form>
      </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Create Product"
        message="Are you sure you want to create this product?"
        confirmLabel="Create"
        onConfirm={confirmCreate}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
}
