"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, X } from "lucide-react";
import { useCompanyDetails, useUpdateCompany } from "@/hooks/use-companies";
import ConfirmModal from "@/components/ConfirmModal";

export default function EditCompanyPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: company } = useCompanyDetails(Number(id));
  const updateCompany = useUpdateCompany();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (company) {
      setForm({ name: company.name, email: company.email || "", phone: company.phone || "", address: company.address || "" });
    }
  }, [company]);

  const updateField = (field: string) => {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm({ ...form, [field]: event.target.value });
    };
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmUpdate = async () => {
    await updateCompany.mutateAsync({ id: Number(id), data: form });
    setShowConfirmModal(false);
    router.push("/companies");
  };

  return (
    <>
      <div className="page-header">
        <h2>Edit Company</h2>
      </div>
      <div className="card max-w-sm">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input required value={form.name} onChange={updateField("name")} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={updateField("email")} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={updateField("phone")} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea value={form.address} onChange={updateField("address")} />
          </div>
          <div className="flex gap-1">
            <button type="submit" className="btn btn-primary"><Save size={16} /> Save</button>
            <button type="button" className="btn" onClick={() => router.push("/companies")}><X size={16} /> Cancel</button>
          </div>
        </form>
      </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Update Company"
        message="Are you sure you want to save changes to this company?"
        confirmLabel="Save"
        onConfirm={confirmUpdate}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
}
