"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, X } from "lucide-react";
import { useUserDetails, useUpdateUser } from "@/hooks/use-users";
import { useCustomersList } from "@/hooks/use-customers";
import ConfirmModal from "@/components/ConfirmModal";

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: user } = useUserDetails(Number(id));
  const updateUser = useUpdateUser();
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

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username,
        email: user.email || "",
        password: "",
        role: user.role,
        view_only: Boolean(user.view_only),
        customer_id: user.customer_id ? String(user.customer_id) : "",
      });
    }
  }, [user]);

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

  const confirmUpdate = async () => {
    const payload: Record<string, unknown> = {};
    if (form.username) payload.username = form.username;
    if (form.email) payload.email = form.email;
    if (form.password) payload.password = form.password;
    payload.role = form.role;
    payload.view_only = form.view_only;
    payload.customer_id = form.customer_id ? Number(form.customer_id) : null;

    await updateUser.mutateAsync({ id: Number(id), data: payload });
    setShowConfirmModal(false);
    router.push("/users");
  };

  if (!user) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <>
      <div className="page-header">
        <h2>Edit User</h2>
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
            <label>Password (leave blank to keep current)</label>
            <input type="password" value={form.password} onChange={updateField("password")} placeholder="Leave blank to keep unchanged" />
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
            <button type="submit" className="btn btn-primary"><Save size={16} /> Save</button>
            <button type="button" className="btn" onClick={() => router.push("/users")}><X size={16} /> Cancel</button>
          </div>
        </form>
      </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Update User"
        message="Are you sure you want to save changes to this user?"
        confirmLabel="Save"
        onConfirm={confirmUpdate}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
}
