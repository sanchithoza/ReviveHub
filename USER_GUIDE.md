# ReviveHub — User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Login & Authentication](#login--authentication)
3. [Dashboard](#dashboard)
4. [Masters (Companies, Customers, Products)](#masters)
5. [Replacement Workflow](#replacement-workflow)
6. [Reports](#reports)
7. [User Management (Admin)](#user-management-admin)
8. [Roles & Permissions](#roles--permissions)

---

## Getting Started

Open your browser and navigate to `http://localhost:3000`. You will see the login screen.

---

## Login & Authentication

Enter your username and password to sign in.

- **Default admin credentials**: `admin` / `admin123`
- After successful login, a JWT token is stored in your browser and used for all subsequent API calls.
- Click **Sign Out** at the bottom of the sidebar to end your session.

![Login Screen]

---

## Dashboard

The landing page after login shows a summary dashboard:

- **Stat Cards** — Quick counts of Companies, Customers, Products, and Active Replacements.
- **Pending Replacements** — List of the 5 most recent incomplete replacement transactions with action buttons.
- **Lifecycle State Breakdown** — Bar chart showing how many returns are in each status, filterable by time period (1D, 7D, 1M, 1Y).
- **Company Wise Breakdown** — Top 5 companies by return volume, filterable by time period.

Click any stat card to navigate to the corresponding list page.

---

## Masters

Masters are the core data entities. They are accessible from the **Masters** dropdown in the sidebar.

### Companies

Manage companies whose products are handled for replacements.

| Field     | Description                    |
|-----------|--------------------------------|
| Name      | Company name (required)         |
| Email     | Contact email                   |
| Phone     | Contact number                  |
| Address   | Physical address                |

### Customers

Manage customers who submit replacement requests.

| Field     | Description                    |
|-----------|--------------------------------|
| Name      | Customer name (required)        |
| Email     | Email address (unique)          |
| Phone     | Contact number                  |
| Address   | Physical address                |

### Products

Manage products that are eligible for replacement. Each product belongs to a company.

| Field       | Description                    |
|-------------|--------------------------------|
| Name        | Product name (required)         |
| Company     | Associated company (required)   |
| Model       | Model number/name               |
| Description | Notes about the product         |

### Actions

On each list page:
- **New** (top right) — Opens a form to create a new record.
- **Edit** (pencil icon) — Opens the edit form for an existing record.
- **Delete** (trash icon) — Removes the record after confirmation.

> Records cannot be created, edited, or deleted if your account is in **view-only** mode.

---

## Replacement Workflow

The replacement workflow tracks a returned product through 4 lifecycle stages:

```
Received from Customer
        ↓
   Sent to Company
        ↓
Received from Company
        ↓
     Completed
```

### Creating a New Replacement

1. Click **New Replacement** on the Dashboard or the Replacement list page.
2. Fill in the form:
   - **Customer** — Search and select the customer (or add a new one).
   - **Company** — Select the company whose product is being replaced.
   - **Product** — Select the specific product (filtered by company).
   - **Old Serial Number** — Serial number of the returned unit.
   - **Reason** — Why the product is being returned.
   - **Notes** — Any additional information.
   - **Communication Info** — Contact person, channel, and notes (optional).
3. Confirm to create the replacement record with status **Received from Customer**.

### Advancing Through Stages

Replacements are advanced one step at a time from the list page or the detail page.

**From the list page** — Click the action button in the **Action** column:
- **Send icon** (Received from Customer → Sent to Company)
- **Download icon** (Sent to Company → Received from Company)
- **Check icon** (Received from Company → Completed)

**From the detail page** — Click the action card button:
- Opens a confirmation modal before advancing.
- When receiving from company, you must enter the **new serial number**.

### Detail Page

Click the **View** (external link) icon on any replacement row to see full details, including:
- Company, product, and customer info
- Serial numbers (old and new)
- Status badge
- Complete timeline with 4 date stamps
- Reason, notes, and communication logs

---

## Reports

The Reports section allows you to generate exportable summaries of replacement data.

**Location**: Sidebar → Reports → Replacement

### Features
- **Filters** — Filter by company, customer, product, status, and date range.
- **Column Selection** — Toggle which columns appear in the report.
- **Search** — Free-text search across all fields.

### Export Options
- **Export to Excel** — Downloads an `.xlsx` file with the filtered data.
- **Export to PDF** — Downloads a `.pdf` file with a formatted table.

---

## User Management (Admin)

Available only to users with the **admin** role. Located under Masters → **Users**.

### Creating a User
1. Click **New User**.
2. Fill in:
   - **Username** (required, unique)
   - **Email** (optional)
   - **Password** (required)
   - **Role** — Admin, Operator, or Viewer
   - **View Only** — Check to prevent all write operations
   - **Link to Customer** — For viewer users, optionally link to a customer record so they can only see their own returns.

### Editing a User
- Change any field except the password (leave blank to keep current).
- Change role, view-only status, or customer link.

### Deleting a User
- Permanently removes the user account.

---

## Roles & Permissions

| Action                    | Admin | Operator | Viewer |
|---------------------------|-------|----------|--------|
| View records              | ✅    | ✅       | ✅     |
| Create records            | ✅    | ✅       | ❌     |
| Edit records              | ✅    | ✅       | ❌     |
| Delete records            | ✅    | ✅       | ❌     |
| Manage users              | ✅    | ❌       | ❌     |
| Access reports            | ✅    | ✅       | ✅     |

**View-Only Override**: If the **View Only** checkbox is enabled on a user account, all write operations are blocked regardless of the user's role. An error popup will appear if a view-only user attempts a write action.

**Customer-Linked Viewer**: A viewer linked to a customer will only see replacement records belonging to that customer. This is useful for allowing customers to track their own return statuses.

---

## Troubleshooting

| Problem                          | Likely Cause                     | Solution                              |
|----------------------------------|----------------------------------|---------------------------------------|
| Cannot log in                    | Wrong credentials                | Reset password via admin user or seed |
| 401 Unauthorized                 | Token expired or missing         | Log out and log in again              |
| 403 Forbidden on write action    | Account is view-only             | Contact admin to disable view-only    |
| 403 Forbidden on any action      | Insufficient role                | Contact admin to upgrade role         |
| "Cannot read properties..." error| Backend not running              | Start the server                      |
| Blank page on /login             | Already authenticated            | Clears localStorage or wait for redirect |

---

## Support

For issues or feature requests, please contact your system administrator.
