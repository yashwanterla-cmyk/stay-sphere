# 📚 StaySphere — Developer Prompt Library

This prompt library documents the structured, engineering-focused prompts used during the design, development, and testing of **StaySphere**. These prompts are categorized by application layer (Database, Backend API, Frontend React Components, Payments, and Testing) and can be used to reproduce, extend, or refactor similar property management solutions.

---

## 🗄️ 1. Database & Schema Design Prompts

### Database Schema Modeling
> **System Role**: Senior Database Architect & Backend Engineer
>
> **Task**: Design a Relational Database Schema for a PG/Hostel Management System.
>
> **Prompt**:
> ```text
> Act as a senior database architect. I need a database schema for "StaySphere", a PG & Hostel Management System.
> The database should support the following core entities and business rules:
> 1. User: Accounts with roles (super_admin, owner, staff, tenant) and status (active, suspended).
> 2. Property: Managed by owners, containing rooms.
> 3. Room: Belongs to a property, has room_number, capacity, floor, and price_per_bed.
> 4. Bed: A room has multiple beds based on its capacity. Each bed has status (vacant, occupied, maintenance).
> 5. Tenant: Links a User (tenant role) to a specific Bed. Tracks lease_start, lease_end, KYC status, and emergency contacts.
> 6. Invoice: Belongs to a Tenant. Contains billing amount, month, billing_date, due_date, and payment status (paid, pending, overdue).
> 7. MaintenanceRequest: Raised by a tenant or staff, associated with a property. Has priority (low, medium, high), status (pending, in_progress, resolved), and an optional assigned staff user.
> 8. Visitor: Logs external guest entries. Tracks name, phone, purpose, entry_time, and exit_time.
> 9. Attendance: Logs check-in/out times for staff and tenants with automated status tags.
> 10. Notice: Notice board announcements with pinned functionality.
> 11. Expense: Tracks operational expenses (water, electricity, salaries) for properties.
> 12. Agreement: Digital tenant agreements with signature fields and execution timestamps.
>
> Please write the database schema using SQLAlchemy 2.0 ORM classes with type annotations, foreign keys, and cascading deletes where appropriate. Use SQLite-compatible types.
> ```

---

## 🔑 2. Backend API & Routing Prompts

### Role-Based Access Control (RBAC) Middleware
> **System Role**: FastAPI Security Specialist
>
> **Task**: Implement custom security dependency for role validation.
>
> **Prompt**:
> ```text
> I am building a FastAPI backend. I have JWT-based authentication configured.
> I want to implement role-based access control (RBAC) for my endpoints.
> Write a reusable security dependency `get_current_active_user` and a wrapper helper class `RoleChecker` that allows me to enforce role permissions on specific routes.
> For example:
> - `router.post("/", dependencies=[Depends(RoleChecker(["owner", "super_admin"]))])`
>
> Ensure it handles missing headers, token expiration (7-day duration), invalid tokens, and unauthorized roles gracefully by returning standard HTTP exceptions (401 and 403). Use Python-Jose and Passlib for hashing/validation.
> ```

### Automatic Bed Generation Logic
> **System Role**: Python/FastAPI Backend Developer
>
> **Task**: Write a backend route to create rooms and auto-generate beds.
>
> **Prompt**:
> ```text
> Write a FastAPI endpoint POST `/api/v1/rooms/property/{property_id}`.
> When a room is created (e.g. room_number: "202", capacity: 3), the backend must automatically create 3 bed entries in the `beds` table.
> The bed numbers should be formatted as `<room_number>-A`, `<room_number>-B`, `<room_number>-C`, etc., and set to `vacant` status.
> Ensure this runs inside a single database transaction so that if bed creation fails, the room creation is rolled back. Include full Pydantic request and response schemas.
> ```

---

## 🎨 3. Frontend React & UI Prompts

### Dashboard Analytics Grid
> **System Role**: Frontend UX Engineer (React + Tailwind CSS + Lucide Icons + Recharts)
>
> **Task**: Create a dashboard summary interface with charts.
>
> **Prompt**:
> ```text
> Act as a UX engineer. I need a React functional component `Dashboard.tsx` for StaySphere.
> The dashboard is for PG owners. It should feature:
> 1. A summary cards grid:
>    - Total Revenue (with standard monthly growth metric)
>    - Occupancy Rate (occupied beds / total beds as a percentage)
>    - Active Maintenance Tickets (pending count)
>    - Overdue Invoices count
> 2. Interactive Charts using Recharts:
>    - A bar chart showing monthly collection vs. expenses.
>    - A pie chart showing occupancy breakdown (Occupant distribution by property).
> 3. A list of "Recent Activities" (e.g., new check-ins, logged visitors, raised complaints).
>
> Style it beautifully using Tailwind CSS. Use clean slate/indigo hues, drop shadows, hover transitions, and Lucide React icons. Make the dashboard fully responsive with mobile layout collapse.
> ```

### Interactive Floor Map & Bed Allocator
> **System Role**: Frontend Developer & UI Specialist
>
> **Task**: Create an interactive room allocation panel.
>
> **Prompt**:
> ```text
> Write a React component `RoomSelector.tsx` that helps property owners visualize rooms and allocate vacant beds.
> - The component should fetch rooms for a property.
> - Display each room as a card containing its beds.
> - Color-code beds visually based on status:
>   - Green for Vacant (clickable, opens an allocation modal)
>   - Red for Occupied (displays tenant name)
>   - Yellow for Maintenance
> - Provide a search filter by Room Number and Room Type (single, double, triple).
> - When a vacant bed is clicked, callback `onSelectBed(bedId)` is triggered.
>
> Use Framer Motion for subtle entry animations and transitions. Keep the styling premium and modern.
> ```

---

## 💰 4. Integration Prompts

### Simulated Razorpay Payment Integration
> **System Role**: Full-Stack Integrations Developer
>
> **Task**: Connect React frontend and FastAPI backend for rent invoice payments.
>
> **Prompt**:
> ```text
> I want to simulate payment processing in StaySphere using Razorpay.
> 1. In the backend:
>    - Write an endpoint POST `/api/v1/rent/pay/{invoice_id}` that simulates creating a Razorpay order. It should generate a dummy `razorpay_order_id`.
>    - Write a verification endpoint POST `/api/v1/rent/verify-payment` that accepts payment signatures (`razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`), verifies them, and updates the invoice status to `paid` with the current time.
> 2. In the frontend:
>    - Create a "Pay Now" button in the Invoice list.
>    - When clicked, it should call the order creation endpoint and trigger a mock Razorpay checkout screen (a clean modal simulating the payment).
>    - On success, it calls the verification endpoint to update the UI status.
> Write clean code for both backend endpoints and frontend handler logic.
> ```

### Digital Rental Agreement Signing
> **System Role**: Frontend Canvas Developer
>
> **Task**: Implement dynamic digital signature capturing.
>
> **Prompt**:
> ```text
> Create a React component `AgreementSigner.tsx` that displays a rental agreement's legal text.
> Below the terms, include a signature box where the tenant can draw their signature using an HTML5 Canvas.
> Features:
> - Clear canvas button.
> - Draw signature using mouse drag or touch events.
> - Save signature as a Base64 image and send it to the backend via POST `/api/v1/agreements/{agreement_id}/sign` with payload `{ signature_data: "data:image/png;base64,..." }`.
> - Disable signing button if canvas is empty.
>
> Ensure it is responsive and works smoothly on mobile screens.
> ```

---

## 🧪 5. Testing & Verification Prompts

### API Integration Testing with Pytest
> **System Role**: QA Automation Engineer
>
> **Task**: Write unit and integration tests for auth and room reservation.
>
> **Prompt**:
> ```text
> Write python unit tests using `pytest` and `httpx.AsyncClient` for our FastAPI authentication and room reservation routes.
> Ensure you cover:
> 1. User registration and login flow (obtaining the JWT token).
> 2. Accessing a protected endpoint (`/api/v1/properties`) with and without a valid token (assert 200 and 401).
> 3. Allocating an occupied bed to a new tenant (should fail with a 400 Bad Request error).
> Use a mock SQL database session (`sqlite:///:memory:`) using SQLAlchemy's `sessionmaker` override to avoid writing data to the development database.
> ```
