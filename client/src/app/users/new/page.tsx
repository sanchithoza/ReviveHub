"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import { useCreateUser } from "@/hooks/use-users";
import { useCustomersList } from "@/hooks/use-customers";
import ConfirmModal from "@/components/ConfirmModal";

export default function NewUserPage() {
  const router = useRouter();
  const createUser = useCreateUser();
  const { data: customers = [] } = useCustomersList();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "viewer",
    view_only: false,
    customer_id: "",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const updateField = (field: string) => {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = field === "view_only" ? (event.target as HTMLInputElement).checked : event.target.value;
      setForm({ ...form, [field]: value });
    };
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmCreate = async () => {
    const payload: Record<string, unknown> = {
      username: form.username,
      email: form.email || undefined,
      password: form.password,
      role: form.role,
      view_only: form.view_only,
    };
    if (form.customer_id) {
      payload.customer_id = Number(form.customer_id);
    }
    await createUser.mutateAsync(payload);
    setShowConfirmModal(false);
    router.push("/users");
  };

  return (
    <>
      <div className="page-header">
        <h2>New User</h2>
      </div>
      <div className="card max-w-sm">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username *</label>
            <input required value={form.username} onChange={updateField("username")} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={updateField("email")} />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" required value={form.password} onChange={updateField("password")} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={updateField("role")}>
              <option value="admin">Admin</option>
              <option value="operator">Operator</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={form.view_only} onChange={updateField("view_only")} style={{ width: "auto", marginRight: "0.5rem" }} />
              View Only (blocks all write operations)
            </label>
          </div>
          <div className="form-group">
            <label>Link to Customer (for viewer role)</label>
            <select value={form.customer_id} onChange={updateField("customer_id")}>
              <option value="">-- None --</option>
              {customers.map((customer: any) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1">
            <button type="submit" className="btn btn-primary"><Save size={16} /> Create</button>
            <button type="button" className="btn" onClick={() => router.push("/users")}><X size={16} /> Cancel</button>
          </div>
        </form>
      </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Create User"
        message="Are you sure you want to create this user?"
        confirmLabel="Create"
        onConfirm={confirmCreate}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
}
