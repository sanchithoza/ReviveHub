"use client";

import { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, FileText, Search } from "lucide-react";
import { api } from "@/lib/api";
import SearchableSelectModal from "@/components/SearchableSelectModal";

interface ColumnOption {
  key: string;
  label: string;
}

interface ReturnRow {
  id: number;
  company_name: string;
  customer_name: string;
  product_name: string;
  old_serial_number: string | null;
  new_serial_number: string | null;
  status: string;
  received_from_customer_date: string;
  sent_to_company_date: string;
  received_from_company_date: string;
  sent_to_customer_date: string;
  reason: string | null;
  notes: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  received_from_customer: "Received from Customer",
  sent_to_company: "Sent to Company",
  received_from_company: "Received from Company",
  completed: "Completed",
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "received_from_customer", label: "Received from Customer" },
  { value: "sent_to_company", label: "Sent to Company" },
  { value: "received_from_company", label: "Received from Company" },
  { value: "completed", label: "Completed" },
];

const ALL_COLUMNS: ColumnOption[] = [
  { key: "id", label: "ID" },
  { key: "company_name", label: "Company" },
  { key: "customer_name", label: "Customer" },
  { key: "product_name", label: "Product" },
  { key: "old_serial_number", label: "Old Serial" },
  { key: "new_serial_number", label: "New Serial" },
  { key: "status", label: "Status" },
  { key: "received_from_customer_date", label: "Inward (Customer)" },
  { key: "sent_to_company_date", label: "Outward (Company)" },
  { key: "received_from_company_date", label: "Inward (Company)" },
  { key: "sent_to_customer_date", label: "Outward (Customer)" },
  { key: "reason", label: "Reason" },
  { key: "notes", label: "Notes" },
];

function formatDateForDisplay(dateString: string | null): string {
  if (!dateString) {
    return "-";
  }
  return new Date(dateString).toLocaleDateString();
}

export default function ReplacementReportPage() {
  const [allReturns, setAllReturns] = useState<ReturnRow[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const defaultColumns = ["id", "company_name", "customer_name", "product_name", "old_serial_number", "new_serial_number", "status", "received_from_customer_date", "sent_to_customer_date"];
  const [selectedColumns, setSelectedColumns] = useState<string[]>(defaultColumns);

  useEffect(() => {
    Promise.all([
      api.returns.list(),
      api.companies.list(),
      api.customers.list(),
      api.products.list(),
    ]).then(([returnsData, companiesData, customersData, productsData]) => {
      setAllReturns(returnsData);
      setCompanies(companiesData);
      setCustomers(customersData);
      setProducts(productsData);
    });
  }, []);

  const filteredReturns = useMemo(() => {
    return allReturns.filter((returnItem) => {
      if (filterStatus !== "") {
        if (returnItem.status !== filterStatus) {
          return false;
        }
      }
      if (filterCompany !== "") {
        if (returnItem.company_name !== filterCompany) {
          return false;
        }
      }
      if (filterCustomer !== "") {
        if (returnItem.customer_name !== filterCustomer) {
          return false;
        }
      }
      if (filterProduct !== "") {
        if (returnItem.product_name !== filterProduct) {
          return false;
        }
      }
      if (filterSearch !== "") {
        const searchText = filterSearch.toLowerCase();
        const matchesSearch =
          (returnItem.company_name && returnItem.company_name.toLowerCase().includes(searchText)) ||
          (returnItem.customer_name && returnItem.customer_name.toLowerCase().includes(searchText)) ||
          (returnItem.product_name && returnItem.product_name.toLowerCase().includes(searchText)) ||
          (returnItem.old_serial_number && returnItem.old_serial_number.toLowerCase().includes(searchText)) ||
          (returnItem.new_serial_number && returnItem.new_serial_number.toLowerCase().includes(searchText));
        if (!matchesSearch) {
          return false;
        }
      }
      if (dateFrom !== "") {
        const fromDate = new Date(dateFrom);
        const receivedDate = new Date(returnItem.received_from_customer_date);
        if (receivedDate < fromDate) {
          return false;
        }
      }
      if (dateTo !== "") {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        const receivedDate = new Date(returnItem.received_from_customer_date);
        if (receivedDate > toDate) {
          return false;
        }
      }
      return true;
    });
  }, [allReturns, filterStatus, filterCompany, filterCustomer, filterProduct, filterSearch, dateFrom, dateTo]);

  const toggleColumn = (columnKey: string) => {
    if (selectedColumns.includes(columnKey)) {
      setSelectedColumns(selectedColumns.filter((key) => key !== columnKey));
    } else {
      setSelectedColumns([...selectedColumns, columnKey]);
    }
  };

  const selectAllColumns = () => {
    setSelectedColumns(ALL_COLUMNS.map((col) => col.key));
  };

  const deselectAllColumns = () => {
    setSelectedColumns([]);
  };

  const getCellValue = (returnItem: ReturnRow, columnKey: string): string => {
    if (columnKey === "status") {
      return STATUS_LABELS[returnItem.status] || returnItem.status;
    }
    if (columnKey === "received_from_customer_date" || columnKey === "sent_to_company_date" || columnKey === "received_from_company_date" || columnKey === "sent_to_customer_date") {
      return formatDateForDisplay((returnItem as any)[columnKey]);
    }
    const value = (returnItem as any)[columnKey];
    if (value === null || value === undefined) {
      return "-";
    }
    return String(value);
  };

  const prepareExportData = () => {
    const visibleColumns = ALL_COLUMNS.filter((col) => selectedColumns.includes(col.key));
    const headers = visibleColumns.map((col) => col.label);
    const rows = filteredReturns.map((returnItem) => {
      return visibleColumns.map((col) => getCellValue(returnItem, col.key));
    });
    return { headers, rows };
  };

  const exportToExcel = () => {
    const { headers, rows } = prepareExportData();
    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Replacements");
    XLSX.writeFile(workbook, "replacement_report.xlsx");
  };

  const exportToPdf = () => {
    const { headers, rows } = prepareExportData();
    const document = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    document.setFontSize(14);
    document.text("Replacement Report", 14, 20);
    document.setFontSize(9);
    document.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
    autoTable(document, {
      head: [headers],
      body: rows,
      startY: 30,
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [15, 52, 96] },
    });
    document.save("replacement_report.pdf");
  };

  const companyOptions = companies.map((c: any) => ({ value: c.name, label: c.name }));
  const customerOptions = customers.map((c: any) => ({ value: c.name, label: c.name }));
  const productOptions = products.map((p: any) => ({ value: p.name, label: p.name }));

  return (
    <>
      <div className="page-header">
        <h2>Replacement Report</h2>
      </div>

      <div className="card mb-2">
        <div className="report-filters">
          <div className="report-filter-row">
            <div className="form-group">
              <label>Date From</label>
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </div>
            <div className="form-group">
              <label>Date To</label>
              <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Company</label>
              <SearchableSelectModal options={companyOptions} value={filterCompany} onChange={setFilterCompany} allLabel="Select Company" />
            </div>
            <div className="form-group">
              <label>Customer</label>
              <SearchableSelectModal options={customerOptions} value={filterCustomer} onChange={setFilterCustomer} allLabel="Select Customer" />
            </div>
            <div className="form-group">
              <label>Product</label>
              <SearchableSelectModal options={productOptions} value={filterProduct} onChange={setFilterProduct} allLabel="Select Product" />
            </div>
            <div className="form-group" style={{ minWidth: "200px" }}>
              <label>Quick Search</label>
              <div className="report-search-input">
                <Search size={14} />
                <input type="text" value={filterSearch} onChange={(event) => setFilterSearch(event.target.value)} placeholder="Search all fields..." autoComplete="off" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-2">
        <div className="report-columns-header">
          <span className="text-muted" style={{ fontSize: "0.8rem" }}>Columns ({selectedColumns.length} selected)</span>
          <div className="report-column-actions">
            <button className="btn btn-sm" onClick={selectAllColumns}>Select All</button>
            <button className="btn btn-sm" onClick={deselectAllColumns}>Clear</button>
          </div>
        </div>
        <div className="report-columns-grid">
          {ALL_COLUMNS.map((column) => {
            const isChecked = selectedColumns.includes(column.key);
            return (
              <label key={column.key} className="report-column-label">
                <input type="checkbox" checked={isChecked} onChange={() => toggleColumn(column.key)} />
                <span>{column.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="report-actions-bar">
        <span className="text-muted">{filteredReturns.length} record(s)</span>
        <div className="flex gap-1">
          <button className="btn btn-primary" onClick={exportToExcel}><Download size={16} /> Export Excel</button>
          <button className="btn btn-primary" onClick={exportToPdf}><FileText size={16} /> Export PDF</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {ALL_COLUMNS.filter((col) => selectedColumns.includes(col.key)).map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReturns.length === 0 ? (
                <tr><td colSpan={selectedColumns.length} className="empty-state">No records found.</td></tr>
              ) : (
                filteredReturns.map((returnItem) => (
                  <tr key={returnItem.id}>
                    {ALL_COLUMNS.filter((col) => selectedColumns.includes(col.key)).map((col) => (
                      <td key={col.key}>{getCellValue(returnItem, col.key)}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
