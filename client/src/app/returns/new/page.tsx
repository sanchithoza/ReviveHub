"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, PlusCircle } from "lucide-react";
import { useCustomersList } from "@/hooks/use-customers";
import { useCompaniesList } from "@/hooks/use-companies";
import { useProductsList } from "@/hooks/use-products";
import { useCreateReturn } from "@/hooks/use-returns";
import ConfirmModal from "@/components/ConfirmModal";
import SearchableSelect from "@/components/SearchableSelect";
import AddEntityModal from "@/components/AddEntityModal";

export default function NewReturnPage() {
  const router = useRouter();
  const { data: customers = [] } = useCustomersList();
  const { data: companies = [] } = useCompaniesList();
  const { data: allProducts = [] } = useProductsList();
  const createReturn = useCreateReturn();
  const [form, setForm] = useState({
    company_id: "",
    customer_id: "",
    product_id: "",
    old_serial_number: "",
    reason: "",
    notes: "",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [entityModalType, setEntityModalType] = useState<"customer" | "company" | "product" | null>(null);

  const [localCustomers, setLocalCustomers] = useState<any[] | null>(null);
  const [localCompanies, setLocalCompanies] = useState<any[] | null>(null);
  const [localProducts, setLocalProducts] = useState<any[] | null>(null);

  const resolvedCustomers = localCustomers || customers;
  const resolvedCompanies = localCompanies || companies;
  const resolvedProducts = localProducts || allProducts;

  const updateField = (field: string) => {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm({ ...form, [field]: event.target.value });
    };
  };

  const handleCompanyChange = (companyValue: string) => {
    setForm({ ...form, company_id: companyValue, product_id: "" });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmCreate = async () => {
    const oldSerialValue = form.old_serial_number || undefined;
    await createReturn.mutateAsync({
      customer_id: Number(form.customer_id),
      product_id: Number(form.product_id),
      old_serial_number: oldSerialValue,
      reason: form.reason,
      notes: form.notes,
    });
    setShowConfirmModal(false);
    router.push("/returns");
  };

  const handleAddEntityConfirm = (newEntity: any) => {
    if (entityModalType === "customer") {
      setLocalCustomers([...resolvedCustomers, newEntity]);
      setForm({ ...form, customer_id: String(newEntity.id) });
    } else if (entityModalType === "company") {
      setLocalCompanies([...resolvedCompanies, newEntity]);
      setForm({ ...form, company_id: String(newEntity.id), product_id: "" });
    } else if (entityModalType === "product") {
      setLocalProducts([...resolvedProducts, newEntity]);
      setForm({ ...form, product_id: String(newEntity.id) });
    }
    setEntityModalType(null);
  };

  const customerOptions = resolvedCustomers.map((customer: any) => ({
    value: String(customer.id),
    label: customer.name,
  }));

  const companyOptions = resolvedCompanies.map((company: any) => ({
    value: String(company.id),
    label: company.name,
  }));

  const filteredProducts = form.company_id
    ? resolvedProducts.filter((product: any) => String(product.company_id) === form.company_id)
    : [];

  const productOptions = filteredProducts.map((product: any) => ({
    value: String(product.id),
    label: product.name,
  }));

  return (
    <>
      <div className="page-header">
        <h2>New Replacement Transaction</h2>
      </div>
      <div className="card max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Customer *</label>
              <div className="select-with-add">
                <SearchableSelect
                  options={customerOptions}
                  value={form.customer_id}
                  onChange={(value: string) => setForm({ ...form, customer_id: value })}
                  placeholder="Search customer..."
                  required
                />
                <button type="button" className="btn-add-entity" onClick={() => setEntityModalType("customer")} aria-label="Add new customer"><PlusCircle size={16} /></button>
              </div>
            </div>
            <div className="form-group">
              <label>Company *</label>
              <div className="select-with-add">
                <SearchableSelect
                  options={companyOptions}
                  value={form.company_id}
                  onChange={handleCompanyChange}
                  placeholder="Search company..."
                  required
                />
                <button type="button" className="btn-add-entity" onClick={() => setEntityModalType("company")} aria-label="Add new company"><PlusCircle size={16} /></button>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Product *</label>
            <div className="select-with-add">
              <SearchableSelect
                options={productOptions}
                value={form.product_id}
                onChange={(value: string) => setForm({ ...form, product_id: value })}
                placeholder={form.company_id ? "Search product..." : "Select a company first"}
                required
              />
              {form.company_id ? (
                <button type="button" className="btn-add-entity" onClick={() => setEntityModalType("product")} aria-label="Add new product"><PlusCircle size={16} /></button>
              ) : null}
            </div>
          </div>
          <div className="form-group">
            <label>Old Serial Number (customer&apos;s unit) *</label>
            <input required value={form.old_serial_number} onChange={updateField("old_serial_number")} placeholder="Enter serial number of the returned unit" />
          </div>
          <div className="form-group">
            <label>Reason</label>
            <textarea value={form.reason} onChange={updateField("reason")} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={updateField("notes")} />
          </div>

          <div className="flex gap-1">
            <button type="submit" className="btn btn-primary"><Save size={16} /> Create</button>
            <button type="button" className="btn" onClick={() => router.push("/returns")}><X size={16} /> Cancel</button>
          </div>
        </form>
      </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Create Replacement"
        message="Are you sure you want to create this Replacement transaction?"
        confirmLabel="Create"
        onConfirm={confirmCreate}
        onCancel={() => setShowConfirmModal(false)}
      />
      <AddEntityModal
        isOpen={entityModalType !== null}
        entityType={entityModalType || "customer"}
        companyId={entityModalType === "product" ? form.company_id : undefined}
        onConfirm={handleAddEntityConfirm}
        onCancel={() => setEntityModalType(null)}
      />
    </>
  );
}
