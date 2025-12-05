# Jaunt - Travel Itinerary Organizer

A clean, minimal web application for managing all your travel bookings in one unified timeline view.

## Features

- **Trip Management**: Create, edit, and organize trips with destinations and dates
- **Booking Management**: Track flights, accommodations, car rentals, restaurants, activities, and more
- **Email Forwarding**: Forward confirmation emails to automatically parse and add bookings
- **Timeline View**: Beautiful chronological view of your entire itinerary
- **Trip Sharing**: Share view-only links with travel companions
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Google & Apple OAuth)
- **Email**: SendGrid for inbound email parsing

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials
- Apple Sign In credentials (optional)
- SendGrid account (for email forwarding feature)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jaunt
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your actual credentials.

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
jaunt/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   └── types/           # TypeScript type definitions
├── prisma/
│   └── schema.prisma    # Database schema
└── public/              # Static assets
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

Private - All rights reserved
