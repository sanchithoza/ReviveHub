"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Users, Package, RotateCcw, Plus, Send, Download, UserCheck, ExternalLink } from "lucide-react";
import { useCompaniesList } from "@/hooks/use-companies";
import { useCustomersList } from "@/hooks/use-customers";
import { useProductsList } from "@/hooks/use-products";
import { useReturnsList } from "@/hooks/use-returns";

type TimePeriod = "daily" | "weekly" | "monthly" | "yearly";

const STATUS_LABELS: Record<string, string> = {
  received_from_customer: "Received from Customer",
  sent_to_company: "Sent to Company",
  received_from_company: "Received from Company",
  completed: "Completed",
};

const PERIOD_LABELS: Record<TimePeriod, string> = {
  daily: "1D",
  weekly: "7D",
  monthly: "1M",
  yearly: "1Y",
};

const STATE_COLORS: Record<string, string> = {
  received_from_customer: "#e67e22",
  sent_to_company: "#0f3460",
  received_from_company: "#8e44ad",
  completed: "#27ae60",
};

const COMPANY_BAR_COLORS = ["#0f3460", "#1a5276", "#2c6faa", "#3d8bc4", "#5ba3d4"];

function getPeriodStart(period: TimePeriod): Date {
  const now = new Date();
  if (period === "daily") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "weekly") {
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }
  if (period === "monthly") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return new Date(now.getFullYear(), 0, 1);
}

function isInPeriod(dateString: string, period: TimePeriod): boolean {
  const date = new Date(dateString);
  const start = getPeriodStart(period);
  return date >= start;
}

function PeriodToggle({
  value,
  onChange,
}: {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
}) {
  const periods: TimePeriod[] = ["daily", "weekly", "monthly", "yearly"];
  return (
    <div className="period-toggle">
      {periods.map((period) => (
        <button
          key={period}
          type="button"
          className={period === value ? "period-btn period-btn-active" : "period-btn"}
          onClick={() => onChange(period)}
        >
          {PERIOD_LABELS[period]}
        </button>
      ))}
    </div>
  );
}

function InsightBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const barWidth = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="insight-row">
      <span className="insight-label">{label}</span>
      <div className="insight-bar-track">
        <div
          className="insight-bar-fill"
          style={{ width: `${barWidth}%`, backgroundColor: color }}
        />
      </div>
      <span className="insight-count">{count}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] || status;
  return <span className={`badge badge-${status}`}>{label}</span>;
}

function ActionButton({ status, returnId }: { status: string; returnId: number }) {
  if (status === "received_from_customer") {
    return (
      <Link href={`/returns/${returnId}`} className="btn btn-sm btn-primary" aria-label="Send to Company">
        <Send size={14} /> Send
      </Link>
    );
  }
  if (status === "sent_to_company") {
    return (
      <Link href={`/returns/${returnId}`} className="btn btn-sm btn-warning" aria-label="Receive from Company">
        <Download size={14} /> Receive
      </Link>
    );
  }
  if (status === "received_from_company") {
    return (
      <Link href={`/returns/${returnId}`} className="btn btn-sm btn-success" aria-label="Give to Customer">
        <UserCheck size={14} /> Complete
      </Link>
    );
  }
  return (
    <Link href={`/returns/${returnId}`} className="btn btn-sm" aria-label="View details">
      <ExternalLink size={14} /> View
    </Link>
  );
}

export default function Dashboard() {
  const { data: companiesData = [] } = useCompaniesList();
  const { data: customersData = [] } = useCustomersList();
  const { data: productsData = [] } = useProductsList();
  const { data: returns = [] } = useReturnsList();
  const [statePeriod, setStatePeriod] = useState<TimePeriod>("monthly");
  const [companyPeriod, setCompanyPeriod] = useState<TimePeriod>("monthly");

  const stats = {
    companies: companiesData.length,
    customers: customersData.length,
    products: productsData.length,
    returns: returns.length,
  };

  const stateData = useMemo(() => {
    const filtered = returns.filter((returnItem: any) =>
      isInPeriod(returnItem.received_from_customer_date, statePeriod),
    );
    const counts: Record<string, number> = {};
    for (const returnItem of filtered) {
      const status = returnItem.status;
      if (counts[status] === undefined) {
        counts[status] = 0;
      }
      counts[status] += 1;
    }
    return Object.entries(counts).map(([status, count]) => ({
      status,
      label: STATUS_LABELS[status] || status,
      count,
    }));
  }, [returns, statePeriod]);

  const companyData = useMemo(() => {
    const filtered = returns.filter((returnItem: any) =>
      isInPeriod(returnItem.received_from_customer_date, companyPeriod),
    );
    const counts: Record<string, number> = {};
    for (const returnItem of filtered) {
      const name = returnItem.company_name || "Unknown";
      if (counts[name] === undefined) {
        counts[name] = 0;
      }
      counts[name] += 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [returns, companyPeriod]);

  const totalState = stateData.reduce((sum, item) => sum + item.count, 0);
  const topCompanies = companyData.slice(0, 5);
  const totalCompany = topCompanies.reduce((sum, item) => sum + item.count, 0);

  const activeReturns = useMemo(() => {
    return returns
      .filter((returnItem: any) => returnItem.status !== "completed")
      .slice(0, 5);
  }, [returns]);

  const pendingCount = returns.filter((returnItem: any) => returnItem.status !== "completed").length;

  const cards = [
    { label: "Companies", count: stats.companies, href: "/companies", color: "#8e44ad", icon: Building2 },
    { label: "Customers", count: stats.customers, href: "/customers", color: "#0f3460", icon: Users },
    { label: "Products", count: stats.products, href: "/products", color: "#27ae60", icon: Package },
    { label: "Active Replacements", count: pendingCount, href: "/returns", color: "#e74c3c", icon: RotateCcw },
  ];

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <Link href="/returns/new" className="btn btn-primary">
          <Plus size={16} /> New Replacement
        </Link>
      </div>
      <div className="stats-grid">
        {cards.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
              <div className="card card-sm" style={{ borderLeft: `3px solid ${item.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="text-muted" style={{ marginBottom: "0.15rem", fontSize: "0.72rem" }}>{item.label}</div>
                  <IconComponent size={18} color={item.color} />
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{item.count}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {activeReturns.length > 0 ? (
        <div className="card mb-2">
          <div className="insight-header">
            <h3 className="insight-title">Pending Replacements</h3>
            <Link href="/returns" className="text-sm">View all</Link>
          </div>
          <div className="recent-list">
            {activeReturns.map((returnItem: any) => {
              const companyName = returnItem.company_name || "-";
              const customerName = returnItem.customer_name || "-";
              const productName = returnItem.product_name || "-";
              return (
                <div key={returnItem.id} className="recent-row">
                  <div className="recent-info">
                    <span className="recent-primary">{companyName} &mdash; {productName}</span>
                    <span className="recent-secondary">{customerName}</span>
                  </div>
                  <StatusBadge status={returnItem.status} />
                  <ActionButton status={returnItem.status} returnId={returnItem.id} />
                </div>
              );
            })}
          </div>
        </div>
      ) : returns.length > 0 ? (
        <div className="card mb-2">
          <p className="text-muted" style={{ padding: "0.5rem 0", textAlign: "center" }}>All replacements completed. <Link href="/returns/new">Create a new one?</Link></p>
        </div>
      ) : null}

      <div className="insight-grid">
        <div className="card">
          <div className="insight-header">
            <h3 className="insight-title">Lifecycle State Breakdown</h3>
            <PeriodToggle value={statePeriod} onChange={setStatePeriod} />
          </div>
          <div className="insight-body">
            {stateData.length === 0 ? (
              <p className="text-muted insight-empty">No returns in this period.</p>
            ) : (
              stateData.map((item) => (
                <InsightBar
                  key={item.status}
                  label={item.label}
                  count={item.count}
                  total={totalState}
                  color={STATE_COLORS[item.status] || "#666"}
                />
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="insight-header">
            <h3 className="insight-title">Company Wise Breakdown</h3>
            <PeriodToggle value={companyPeriod} onChange={setCompanyPeriod} />
          </div>
          <div className="insight-body">
            {topCompanies.length === 0 ? (
              <p className="text-muted insight-empty">No returns in this period.</p>
            ) : (
              topCompanies.map((item, index) => (
                <InsightBar
                  key={item.name}
                  label={item.name}
                  count={item.count}
                  total={totalCompany}
                  color={COMPANY_BAR_COLORS[index % COMPANY_BAR_COLORS.length]}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
