# Frontend Application

This is the React frontend for the CRM system.

## Installation

```bash
npm install
```

## Running

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

The frontend is configured to proxy API calls to the backend on port 5000.

This is configured in `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

## Build Output

Production builds are output to `dist/` directory.

## Key Libraries

- **React 18**: UI framework
- **React Router**: Client-side routing
- **React Query**: Server state management
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
- **Recharts**: Chart library
- **react-hot-toast**: Toast notifications
- **Vite**: Build tool and dev server

## Project Structure

```
src/
├── components/      # Reusable UI components
├── context/         # React Context providers
├── pages/           # Page components
├── utils/           # Utility functions
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

## Features

- Responsive design (mobile, tablet, desktop)
- Server-side pagination
- Search with debounce
- Real-time data with React Query
- Toast notifications
- Loading states
- Error handling
- Protected routes
- Role-based access

## Environment Variables

No environment variables needed for development. The API base URL is configured through Vite's proxy.

For production, configure the API base URL:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

Then update `src/utils/api.js` to use `import.meta.env.VITE_API_BASE_URL`.

