# OSW Warehouse Management System

A modern warehouse management system for Amazon FBA sellers, built with React, TypeScript, and Supabase.

## Features

- 📦 **Product Management** - Import and manage your Amazon product catalog
- 🚚 **FBA Shipment Planning** - Create and track inbound shipments to Amazon
- 📊 **Reporting & Analytics** - Generate reports and track performance metrics
- 🔐 **Secure Authentication** - Powered by Supabase Auth with RLS
- 🔄 **SP-API Integration** - Direct integration with Amazon Seller Partner API
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **State Management**: Redux Toolkit
- **Backend**: Supabase (PostgreSQL)
- **API Integration**: Amazon SP-API
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account
- Amazon Seller Central account with SP-API access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MichaelFlanagan/OSW-WarehouseApp.git
cd OSW-WarehouseApp
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the migration script in your Supabase SQL editor:
   - Copy the contents of `../supabase/migrations/001_initial_schema.sql`
   - Run in Supabase SQL editor

3. Configure Row Level Security policies (already included in the migration)

## Deployment

This project is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy!

The `vercel.json` file includes all necessary configuration.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API services (Supabase, SP-API)
├── store/         # Redux store and slices
├── types/         # TypeScript type definitions
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
└── styles/        # Global styles
```

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `REACT_APP_ENVIRONMENT` | Environment (development/production) |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support, please open an issue in the GitHub repository.
