"use client";

import { useEffect, useRef, useState } from "react";
import { Save, X } from "lucide-react";
import { useCreateCustomer } from "@/hooks/use-customers";
import { useCreateCompany } from "@/hooks/use-companies";
import { useCreateProduct } from "@/hooks/use-products";

interface AddEntityModalProps {
  isOpen: boolean;
  entityType: "customer" | "company" | "product";
  companyId?: string;
  onConfirm: (newEntity: any) => void;
  onCancel: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  model: string;
  description: string;
}

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  model: "",
  description: "",
};

const ENTITY_CONFIG = {
  customer: { title: "Add Customer", label: "Customer Name" },
  company: { title: "Add Company", label: "Company Name" },
  product: { title: "Add Product", label: "Product Name" },
};

export default function AddEntityModal({
  isOpen,
  entityType,
  companyId,
  onConfirm,
  onCancel,
}: AddEntityModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const config = ENTITY_CONFIG[entityType];
  const createCustomer = useCreateCustomer();
  const createCompany = useCreateCompany();
  const createProduct = useCreateProduct();

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm);
      setSaving(false);
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.name.trim() === "") return;
    setSaving(true);
    try {
      let newEntity: any;
      if (entityType === "customer") {
        newEntity = await createCustomer.mutateAsync({
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          address: form.address.trim() || undefined,
        });
      } else if (entityType === "company") {
        newEntity = await createCompany.mutateAsync({
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          address: form.address.trim() || undefined,
        });
      } else {
        newEntity = await createProduct.mutateAsync({
          name: form.name.trim(),
          model: form.model.trim() || undefined,
          description: form.description.trim() || undefined,
          company_id: companyId ? Number(companyId) : undefined,
        });
      }
      onConfirm(newEntity);
    } catch (error) {
      console.error("Failed to create", entityType, error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(event) => event.stopPropagation()} style={{ maxWidth: "400px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>{config.title}</h3>
          <button type="button" className="btn btn-sm" onClick={onCancel} aria-label="Close"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{config.label} *</label>
            <input ref={nameRef} required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={`Enter ${entityType} name`} />
          </div>
          {entityType !== "product" ? (
            <>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email address" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Phone number" />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Address" />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Model</label>
                <input value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} placeholder="Product model" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Product description" />
              </div>
            </>
          )}
          <div className="flex gap-1" style={{ justifyContent: "flex-end", marginTop: "1rem" }}>
            <button type="button" className="btn" onClick={onCancel}><X size={16} /> Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}><Save size={16} /> {saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
