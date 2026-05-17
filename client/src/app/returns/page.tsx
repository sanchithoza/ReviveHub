"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Download, UserCheck, ExternalLink, Plus, Send } from "lucide-react";
import { api } from "@/lib/api";
import ConfirmModal from "@/components/ConfirmModal";

const statusLabels: Record<string, string> = {
  received_from_customer: "Received from Customer",
  sent_to_company: "Sent to Company",
  received_from_company: "Received from Company",
  completed: "Completed",
};

const statusFilterOptions = [
  { value: "", label: "All Statuses" },
  { value: "received_from_customer", label: "Received from Customer" },
  { value: "sent_to_company", label: "Sent to Company" },
  { value: "received_from_company", label: "Received from Company" },
  { value: "completed", label: "Completed" },
];

export default function ReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionTargetId, setActionTargetId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);
  const [newSerialInput, setNewSerialInput] = useState("");

  const load = () => api.returns.list().then(setReturns);
  useEffect(() => { load(); }, []);

  const handleSendToCompany = async () => {
    if (actionTargetId === null) return;
    await api.returns.sendToCompany(actionTargetId);
    setActionTargetId(null);
    setActionType(null);
    load();
  };

  const handleReceiveFromCompany = async () => {
    if (actionTargetId === null) return;
    if (newSerialInput === "") {
      alert("Enter the new serial number received from the company.");
      return;
    }
    await api.returns.receiveFromCompany(actionTargetId, { new_serial_number: newSerialInput });
    setActionTargetId(null);
    setActionType(null);
    setNewSerialInput("");
    load();
  };

  const handleComplete = async () => {
    if (actionTargetId === null) return;
    await api.returns.complete(actionTargetId);
    setActionTargetId(null);
    setActionType(null);
    load();
  };

  const promptAction = (id: number, action: string) => {
    setActionTargetId(id);
    setActionType(action);
    if (action !== "receive-from-company") {
      setNewSerialInput("");
    }
  };

  const cancelAction = () => {
    setActionTargetId(null);
    setActionType(null);
    setNewSerialInput("");
  };

  const lowerSearch = searchText.toLowerCase();

  const filteredReturns = returns.filter((returnItem) => {
    if (statusFilter !== "" && returnItem.status !== statusFilter) {
      return false;
    }
    if (lowerSearch === "") {
      return true;
    }
    const searchFields = [
      returnItem.company_name,
      returnItem.customer_name,
      returnItem.product_name,
      returnItem.old_serial_number,
      returnItem.new_serial_number,
    ];
    return searchFields.some((field) => {
      if (field) {
        return String(field).toLowerCase().includes(lowerSearch);
      }
      return false;
    });
  });

  let actionModal;
  if (actionTargetId !== null && actionType !== null) {
    if (actionType === "send-to-company") {
      actionModal = (
        <ConfirmModal
          isOpen={true}
          title="Send to Company"
          message="Mark this unit as sent to the company for replacement?"
          confirmLabel="Send to Company"
          onConfirm={handleSendToCompany}
          onCancel={cancelAction}
        />
      );
    } else if (actionType === "receive-from-company") {
      actionModal = (
        <ConfirmModal
          isOpen={true}
          title="Receive from Company"
          message="Enter the new serial number received from the company."
          confirmLabel="Receive from Company"
          onConfirm={handleReceiveFromCompany}
          onCancel={cancelAction}
        >
          <div className="form-group">
            <label>New Serial Number *</label>
            <input
              value={newSerialInput}
              onChange={(event) => setNewSerialInput(event.target.value)}
              placeholder="Enter new serial number"
              autoFocus
            />
          </div>
        </ConfirmModal>
      );
    } else if (actionType === "complete") {
      actionModal = (
        <ConfirmModal
          isOpen={true}
          title="Give to Customer"
          message="Mark this replacement as given back to the customer?"
          confirmLabel="Give to Customer"
          onConfirm={handleComplete}
          onCancel={cancelAction}
        />
      );
    }
  }

  let returnRows;
  if (filteredReturns.length === 0) {
    returnRows = (
      <tr><td colSpan={9} className="empty-state">No Replacement records found</td></tr>
    );
  } else {
    returnRows = filteredReturns.map((returnItem) => {
      const companyName = returnItem.company_name ? returnItem.company_name : "-";
      const customerName = returnItem.customer_name ? returnItem.customer_name : "-";
      const productName = returnItem.product_name ? returnItem.product_name : "-";
      const oldSerial = returnItem.old_serial_number ? returnItem.old_serial_number : "-";
      const newSerial = returnItem.new_serial_number ? returnItem.new_serial_number : "-";
      const statusLabel = statusLabels[returnItem.status] ? statusLabels[returnItem.status] : returnItem.status;

      let actionButton;
      if (returnItem.status === "received_from_customer") {
        actionButton = (
          <button className="btn btn-sm btn-primary" onClick={() => promptAction(returnItem.id, "send-to-company")} aria-label="Send to Company"><Send size={14} /></button>
        );
      } else if (returnItem.status === "sent_to_company") {
        actionButton = (
          <button className="btn btn-sm btn-warning" onClick={() => promptAction(returnItem.id, "receive-from-company")} aria-label="Receive from Company"><Download size={14} /></button>
        );
      } else if (returnItem.status === "received_from_company") {
        actionButton = (
          <button className="btn btn-sm btn-success" onClick={() => promptAction(returnItem.id, "complete")} aria-label="Give to Customer"><UserCheck size={14} /></button>
        );
      }

      return (
        <tr key={returnItem.id}>
          <td>{companyName}</td>
          <td>{customerName}</td>
          <td>{productName}</td>
          <td className="mono">{oldSerial}</td>
          <td className="mono">{newSerial}</td>
          <td><span className={`badge badge-${returnItem.status}`}>{statusLabel}</span></td>
          <td>{new Date(returnItem.created_at).toLocaleDateString()}</td>
          <td>{actionButton}</td>
          <td><Link href={`/returns/${returnItem.id}`} className="btn btn-sm" aria-label="View details"><ExternalLink size={14} /></Link></td>
        </tr>
      );
    });
  }

  return (
    <>
      <div className="page-header">
        <h2>Replacement Transactions</h2>
        <Link href="/returns/new" className="btn btn-primary"><Plus size={16} /> New Replacement</Link>
      </div>
      <div className="flex gap-1" style={{ marginBottom: "1rem", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search company, customer, product, serial..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          style={{ flex: 1 }}
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          style={{ width: 220 }}
        >
          {statusFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="table-wrapper"><table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Old Serial</th>
            <th>New Serial</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {returnRows}
        </tbody>
      </table></div>
      {actionModal}
    </>
  );
}
