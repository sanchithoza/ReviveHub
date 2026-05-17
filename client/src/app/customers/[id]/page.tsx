"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, X } from "lucide-react";
import { useCustomerDetails, useUpdateCustomer } from "@/hooks/use-customers";
import ConfirmModal from "@/components/ConfirmModal";

export default function EditCustomerPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: customer } = useCustomerDetails(Number(id));
  const updateCustomer = useUpdateCustomer();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (customer) {
      setForm({ name: customer.name, email: customer.email || "", phone: customer.phone || "", address: customer.address || "" });
    }
  }, [customer]);

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
    await updateCustomer.mutateAsync({ id: Number(id), data: form });
    setShowConfirmModal(false);
    router.push("/customers");
  };

  return (
    <>
      <div className="page-header">
        <h2>Edit Customer</h2>
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
            <button type="button" className="btn" onClick={() => router.push("/customers")}><X size={16} /> Cancel</button>
          </div>
        </form>
      </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Update Customer"
        message="Are you sure you want to save changes to this customer?"
        confirmLabel="Save"
        onConfirm={confirmUpdate}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
}
