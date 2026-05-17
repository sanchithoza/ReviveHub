"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, PlusCircle } from "lucide-react";
import { api } from "@/lib/api";
import ConfirmModal from "@/components/ConfirmModal";
import SearchableSelect from "@/components/SearchableSelect";
import AddEntityModal from "@/components/AddEntityModal";

const channelOptions = [
  { value: "", label: "Select..." },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "portal", label: "Portal" },
  { value: "in_person", label: "In Person" },
];

export default function NewReturnPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    company_id: "",
    customer_id: "",
    product_id: "",
    old_serial_number: "",
    reason: "",
    notes: "",
    contact_person: "",
    communication_channel: "",
    communication_notes: "",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [entityModalType, setEntityModalType] = useState<"customer" | "company" | "product" | null>(null);

  const loadData = () => {
    Promise.all([
      api.customers.list(),
      api.companies.list(),
      api.products.list(),
    ]).then(([customersList, companiesList, productsList]) => {
      setCustomers(customersList);
      setCompanies(companiesList);
      setAllProducts(productsList);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

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
    const oldSerialValue = form.old_serial_number ? form.old_serial_number : undefined;
    const contactPersonValue = form.contact_person ? form.contact_person : undefined;
    const channelValue = form.communication_channel ? form.communication_channel : undefined;
    const communicationNotesValue = form.communication_notes ? form.communication_notes : undefined;
    await api.returns.create({
      customer_id: Number(form.customer_id),
      product_id: Number(form.product_id),
      old_serial_number: oldSerialValue,
      reason: form.reason,
      notes: form.notes,
      contact_person: contactPersonValue,
      communication_channel: channelValue,
      communication_notes: communicationNotesValue,
    });
    setShowConfirmModal(false);
    router.push("/returns");
  };

  const handleAddEntityConfirm = (newEntity: any) => {
    if (entityModalType === "customer") {
      setCustomers([...customers, newEntity]);
      setForm({ ...form, customer_id: String(newEntity.id) });
    } else if (entityModalType === "company") {
      setCompanies([...companies, newEntity]);
      setForm({ ...form, company_id: String(newEntity.id), product_id: "" });
    } else if (entityModalType === "product") {
      setAllProducts([...allProducts, newEntity]);
      setForm({ ...form, product_id: String(newEntity.id) });
    }
    setEntityModalType(null);
  };

  const customerOptions = customers.map((customer) => ({
    value: String(customer.id),
    label: customer.name,
  }));

  const companyOptions = companies.map((company) => ({
    value: String(company.id),
    label: company.name,
  }));

  const filteredProducts = form.company_id
    ? allProducts.filter((product) => String(product.company_id) === form.company_id)
    : [];

  const productOptions = filteredProducts.map((product) => ({
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

          <h3 className="section-heading">Communication Info</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Contact Person</label>
              <input value={form.contact_person} onChange={updateField("contact_person")} />
            </div>
            <div className="form-group">
              <label>Channel</label>
              <SearchableSelect
                options={channelOptions}
                value={form.communication_channel}
                onChange={(value: string) => setForm({ ...form, communication_channel: value })}
                placeholder="Select channel"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Communication Notes</label>
            <textarea value={form.communication_notes} onChange={updateField("communication_notes")} />
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
