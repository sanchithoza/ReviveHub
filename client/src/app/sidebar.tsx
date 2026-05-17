"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useReturnsList } from "@/hooks/use-returns";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mastersOpen, setMastersOpen] = useState(false);
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const { data: returnsData = [] } = useReturnsList();

  const pendingCount = returnsData.filter(
    (returnItem: any) => returnItem.status !== "completed"
  ).length;

  const handleSidebarToggle = () => {
    setSidebarOpen(sidebarOpen === false);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleMastersToggle = () => {
    setMastersOpen(mastersOpen === false);
  };

  const handleTransactionToggle = () => {
    setTransactionOpen(transactionOpen === false);
  };

  const handleReportsToggle = () => {
    setReportsOpen(reportsOpen === false);
  };

  let overlayClassName = "sidebar-overlay";
  if (sidebarOpen) {
    overlayClassName = "sidebar-overlay open";
  }

  let sidebarClassName = "sidebar";
  if (sidebarOpen) {
    sidebarClassName = "sidebar open";
  }

  return (
    <>
      <div className={overlayClassName} onClick={closeSidebar} />
      <button className="hamburger" onClick={handleSidebarToggle}>☰</button>
      <aside className={sidebarClassName}>
        <h1>ReviveHub</h1>
        <nav>
          <Link href="/" onClick={closeSidebar}>Dashboard</Link>
          <button
            type="button"
            className="sidebar-dropdown-toggle"
            onClick={handleMastersToggle}
            aria-expanded={mastersOpen}
          >
            <span>Masters</span>
            <ChevronDown
              size={14}
              className={mastersOpen ? "sidebar-chevron open" : "sidebar-chevron"}
            />
          </button>
          {mastersOpen ? (
            <div className="sidebar-submenu">
              <Link href="/companies" onClick={closeSidebar}>Companies</Link>
              <Link href="/customers" onClick={closeSidebar}>Customers</Link>
              <Link href="/products" onClick={closeSidebar}>Products</Link>
            </div>
          ) : null}
          <button
            type="button"
            className="sidebar-dropdown-toggle"
            onClick={handleTransactionToggle}
            aria-expanded={transactionOpen}
          >
            <span>Transaction</span>
            <ChevronDown
              size={14}
              className={transactionOpen ? "sidebar-chevron open" : "sidebar-chevron"}
            />
          </button>
          {transactionOpen ? (
            <div className="sidebar-submenu">
              <Link href="/returns" onClick={closeSidebar} className="sidebar-link-with-badge">
                <span>Replacement</span>
                {pendingCount > 0 ? (
                  <span className="sidebar-badge">{pendingCount}</span>
                ) : null}
              </Link>
            </div>
          ) : null}
          <button
            type="button"
            className="sidebar-dropdown-toggle"
            onClick={handleReportsToggle}
            aria-expanded={reportsOpen}
          >
            <span>Reports</span>
            <ChevronDown
              size={14}
              className={reportsOpen ? "sidebar-chevron open" : "sidebar-chevron"}
            />
          </button>
          {reportsOpen ? (
            <div className="sidebar-submenu">
              <Link href="/reports/replacement" onClick={closeSidebar}>Replacement</Link>
            </div>
          ) : null}
        </nav>
      </aside>
    </>
  );
}
