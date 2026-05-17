"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import { useCreateCompany } from "@/hooks/use-companies";
import ConfirmModal from "@/components/ConfirmModal";

export default function NewCompanyPage() {
  const router = useRouter();
  const createCompany = useCreateCompany();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
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
    await createCompany.mutateAsync(form);
    setShowConfirmModal(false);
    router.push("/companies");
  };

  return (
    <>
      <div className="page-header">
        <h2>New Company</h2>
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
            <button type="submit" className="btn btn-primary"><Save size={16} /> Create</button>
            <button type="button" className="btn" onClick={() => router.push("/companies")}><X size={16} /> Cancel</button>
          </div>
        </form>
      </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Create Company"
        message="Are you sure you want to create this company?"
        confirmLabel="Create"
        onConfirm={confirmCreate}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
}
