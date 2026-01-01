# Technology Stack Inventory

**Project**: Fintech SaaS Tax Platform (TaxSaas)
**Version**: 1.0 (Development)

## 1. Frontend (The User Interface)

- **React.js (v18)**: The core library for building the UI components.
- **Vite**: The "Engine" that runs React. usage: Extremely fast builds and hot reloading changes.
- **Tailwind CSS**: The styling framework. usage: Making the app look premium (colors, spacing, shadows).
- **React Router DOM**: Handles navigation (e.g., moving from `/dashboard` to `/filing`).
- **Axios**: The "Messenger". usage: Sends data from React to your Backend (Server).
- **Lucide React**: The Icon library (Bells, User icons, Checkmarks).
- **Recharts**: The Charting library. usage: Tax Overview graphs.
- **React Hook Form + Zod**: The Form Manager. usage: Handling complex ITR inputs and validating them (e.g., "PAN must be 10 characters").
- **i18next**: The Translator. usage: Multi-language support.

## 2. Backend (The Brain)

- **Node.js (v18)**: The runtime environment. Allows JavaScript to run on the server.
- **Express.js**: The Web Framework. usage: Defines API routes (e.g., `/api/tax/calculate`).
- **Mongoose**: The Database Manager. usage: Talks to MongoDB to save/load User data.
- **JWT (JSON Web Tokens)**: The Security Guard. usage: Generates digital "Passports" so users stay logged in.
- **Multer**: File Uploader. usage: Handling Form 16 PDF uploads.
- **Nodemailer**: Email Service. usage: Sending OTPs and welcome emails.
- **Bcrypt.js**: Password Encryption. usage: Scrambles passwords so they are never stored as plain text.

## 3. Database (The Memory)

- **MongoDB**: The NoSQL Database. Stores Users, ITR Filings, and Payments.
  - _Why NoSQL?_ Tax forms change every year. MongoDB allows flexible data structures unlike rigid SQL tables.

## 4. DevOps & Infrastructure (The Suitcase)

- **Docker**: The Containerizer. Packages the code into standard accessible units.
- **Docker Compose**: The Orchestrator. Runs the Frontend, Backend, and Database together.
- **Nginx**: The Web Server. usage: Serves the Frontend files in the Docker container efficiently.

## 5. External Services (Third Party Tools)

- **Razorpay**: Payment Gateway. usage: Collecting payments for Tax Filing & CA Booking.
- **WhatsApp API (Mocked)**: Notification service.

## 6. Key Custom Engines (Our IP)

- **Tax Engine (ITR 1 & 2)**: Advanced logic for checking Old vs New Regime, Senior Citizen slabs, and Section 54 exemptions.
- **Validation Engine**: Automated testing suite to prevent calculation errors.
- **Form 16 Parser**: Intelligent text extraction service.
