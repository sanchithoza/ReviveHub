"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Download, UserCheck, Send } from "lucide-react";
import {
  useReturnDetails,
  useSendReturnToCompany,
  useReceiveReturnFromCompany,
  useCompleteReturn,
} from "@/hooks/use-returns";
import ConfirmModal from "@/components/ConfirmModal";

const statusLabels: Record<string, string> = {
  received_from_customer: "Received from Customer",
  sent_to_company: "Sent to Company",
  received_from_company: "Received from Company",
  completed: "Completed",
};

type WorkflowAction = "send-to-company" | "receive-from-company" | "complete";

function formatDateTime(dateString: string): string {
  if (dateString) {
    return new Date(dateString).toLocaleString();
  }
  return "-";
}

export default function ReturnDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: currentReturn } = useReturnDetails(Number(id));
  const sendReturnToCompany = useSendReturnToCompany();
  const receiveReturnFromCompany = useReceiveReturnFromCompany();
  const completeReturn = useCompleteReturn();
  const [newSerialNumber, setNewSerialNumber] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<WorkflowAction | null>(null);

  if (!currentReturn) return <div className="card">Loading...</div>;

  const handleSendToCompany = async () => {
    await sendReturnToCompany.mutateAsync(Number(id));
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const handleReceiveFromCompany = async () => {
    if (newSerialNumber === "") {
      alert("Enter the new serial number received from the company.");
      return;
    }
    await receiveReturnFromCompany.mutateAsync({ id: Number(id), data: { new_serial_number: newSerialNumber } });
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const handleComplete = async () => {
    await completeReturn.mutateAsync(Number(id));
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const promptAction = (action: WorkflowAction) => {
    if (action === "receive-from-company" && newSerialNumber === "") {
      alert("Enter the new serial number received from the company.");
      return;
    }
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    if (pendingAction === "send-to-company") {
      handleSendToCompany();
    } else if (pendingAction === "receive-from-company") {
      handleReceiveFromCompany();
    } else if (pendingAction === "complete") {
      handleComplete();
    }
  };

  const actionTitles: Record<WorkflowAction, string> = {
    "send-to-company": "Send to Company",
    "receive-from-company": "Receive from Company",
    complete: "Give to Customer",
  };

  const actionMessages: Record<WorkflowAction, string> = {
    "send-to-company": "Mark this unit as sent to the company for replacement?",
    "receive-from-company": "Mark this replacement as received from the company?",
    complete: "Mark this replacement as given back to the customer?",
  };

  const statusLabel = statusLabels[currentReturn.status] ? statusLabels[currentReturn.status] : currentReturn.status;
  const oldSerialDisplay = currentReturn.old_serial_number ? currentReturn.old_serial_number : "-";
  const newSerialDisplay = currentReturn.new_serial_number ? currentReturn.new_serial_number : "-";

  let hasCommunication = false;
  if (currentReturn.contact_person) {
    hasCommunication = true;
  }
  if (currentReturn.communication_channel) {
    hasCommunication = true;
  }
  if (currentReturn.communication_notes) {
    hasCommunication = true;
  }

  let workflowContent;
  if (currentReturn.status === "completed") {
    workflowContent = (
      <div className="detail-card">
        <div className="detail-card-status">
          <div className="badge badge-completed" style={{ fontSize: "0.85rem", padding: "0.3rem 0.8rem" }}>Completed</div>
          <p className="text-muted" style={{ marginTop: "0.3rem" }}>This replacement has been given to the customer.</p>
        </div>
      </div>
    );
  } else if (currentReturn.status === "received_from_customer") {
    workflowContent = (
      <div className="detail-card detail-card-action">
        <div className="detail-card-icon"><ArrowUpRight size={20} /></div>
        <div className="detail-card-text">
          <h3>Send to Company</h3>
          <p className="text-muted">The unit has been received from the customer. Send it to the company for a replacement.</p>
        </div>
        <button className="btn btn-primary" onClick={() => promptAction("send-to-company")}><Send size={16} /> Send to Company</button>
      </div>
    );
  } else if (currentReturn.status === "sent_to_company") {
    let handleNewSerialChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setNewSerialNumber(event.target.value);
    };

    workflowContent = (
      <div className="detail-card detail-card-action">
        <div className="detail-card-icon"><Download size={20} /></div>
        <div className="detail-card-text">
          <h3>Receive from Company</h3>
          <p className="text-muted">The unit has been sent to the company. Enter the new serial number once received.</p>
          <div className="label-input-row" style={{ marginTop: "0.5rem" }}>
            <label className="text-sm">New Serial Number:</label>
            <input value={newSerialNumber} onChange={handleNewSerialChange} placeholder="Enter new serial number" />
          </div>
        </div>
        <button className="btn btn-success" onClick={() => promptAction("receive-from-company")}><Download size={16} /> Receive from Company</button>
      </div>
    );
  } else if (currentReturn.status === "received_from_company") {
    workflowContent = (
      <div className="detail-card detail-card-action">
        <div className="detail-card-icon"><UserCheck size={20} /></div>
        <div className="detail-card-text">
          <h3>Give to Customer</h3>
          <p className="text-muted">The replacement has been received from the company. Give it to the customer to complete the process.</p>
        </div>
        <button className="btn btn-success" onClick={() => promptAction("complete")}><UserCheck size={16} /> Give to Customer</button>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h2>Replacement #{currentReturn.id}</h2>
        <button className="btn" onClick={() => router.push("/returns")}><ArrowLeft size={16} /> Back</button>
      </div>

      {workflowContent}

      <div className="detail-cols">
        <div className="card">
          <div className="detail-section">Company</div>
          <div className="detail-value">{currentReturn.company_name || "-"}</div>
          <div className="detail-field-group">
            <div className="detail-field">
              <div className="detail-sublabel">Product</div>
              <div className="detail-value">{currentReturn.product_name}</div>
            </div>
            {currentReturn.product_model ? (
              <div className="detail-value-sm">{currentReturn.product_model}</div>
            ) : null}
          </div>
          <div className="detail-field-group">
            <div className="detail-section">Serial Numbers</div>
            <div className="serials-list">
              <div className="serial-item">
                <span className="detail-sublabel">Old (Customer&apos;s)</span>
                <span className="detail-value mono">{oldSerialDisplay}</span>
              </div>
              <div className="serial-item">
                <span className="detail-sublabel">New (Company&apos;s)</span>
                <span className="detail-value mono">{newSerialDisplay}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="detail-section">Customer</div>
          <div className="detail-value">{currentReturn.customer_name}</div>
          <div className="detail-field-group">
            <div className="detail-field">
              <div className="detail-sublabel">Email</div>
              <div className="detail-value-sm">{currentReturn.customer_email || "-"}</div>
            </div>
            <div className="detail-field">
              <div className="detail-sublabel">Phone</div>
              <div className="detail-value-sm">{currentReturn.customer_phone || "-"}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="detail-section">Timeline</div>
          <div className="timeline-list">
            <div className="timeline-item">
              <span className="detail-sublabel">Step 1 — Inward (from Customer)</span>
              <span className="detail-value-sm mono">{formatDateTime(currentReturn.received_from_customer_date)}</span>
            </div>
            <div className="timeline-item">
              <span className="detail-sublabel">Step 2 — Outward (to Company)</span>
              <span className="detail-value-sm mono">{formatDateTime(currentReturn.sent_to_company_date)}</span>
            </div>
            <div className="timeline-item">
              <span className="detail-sublabel">Step 3 — Inward (from Company)</span>
              <span className="detail-value-sm mono">{formatDateTime(currentReturn.received_from_company_date)}</span>
            </div>
            <div className="timeline-item">
              <span className="detail-sublabel">Step 4 — Outward (to Customer)</span>
              <span className="detail-value-sm mono">{formatDateTime(currentReturn.sent_to_customer_date)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-cols">
        {currentReturn.reason ? (
          <div className="card">
            <div className="detail-section">Reason</div>
            <p className="detail-value-sm" style={{ whiteSpace: "pre-wrap" }}>{currentReturn.reason}</p>
          </div>
        ) : null}

        {currentReturn.notes ? (
          <div className="card">
            <div className="detail-section">Notes</div>
            <p className="detail-value-sm" style={{ whiteSpace: "pre-wrap" }}>{currentReturn.notes}</p>
          </div>
        ) : null}

        {hasCommunication ? (
          <div className="card">
            <div className="detail-section">Communication</div>
            <div className="detail-field-group">
              {currentReturn.contact_person ? (
                <div className="detail-field">
                  <div className="detail-sublabel">Contact Person</div>
                  <div className="detail-value-sm">{currentReturn.contact_person}</div>
                </div>
              ) : null}
              {currentReturn.communication_channel ? (
                <div className="detail-field">
                  <div className="detail-sublabel">Channel</div>
                  <div className="detail-value-sm capitalize">{currentReturn.communication_channel.replace("_", " ")}</div>
                </div>
              ) : null}
            </div>
            {currentReturn.communication_notes ? (
              <p className="detail-value-sm" style={{ whiteSpace: "pre-wrap", marginTop: "0.4rem" }}>{currentReturn.communication_notes}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title={pendingAction ? actionTitles[pendingAction] : "Confirm"}
        message={pendingAction ? actionMessages[pendingAction] : "Are you sure?"}
        confirmLabel={pendingAction ? actionTitles[pendingAction] : "Confirm"}
        onConfirm={confirmAction}
        onCancel={() => {
          setShowConfirmModal(false);
          setPendingAction(null);
        }}
      />
    </>
  );
}
