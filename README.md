# Car Rental Management System

A full-stack web application for managing car rentals with separate interfaces for customers and car owners.

## Features

### For Customers
- Browse and search available cars
- Responsive car catalog with detailed information
- Book cars for specific dates
- User authentication and profile management
- View and manage booking history

### For Car Owners
- Add and manage car listings
- Dashboard with booking analytics
- Manage incoming bookings
- Upload car images with ImageKit integration
- Track rental income

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - Data fetching and caching
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **ImageKit** - Image storage and optimization

## Project Structure

```
CarRental/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── assets/         # Static assets
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/        # Route handlers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── configs/            # Configuration files
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- MongoDB database
- ImageKit account (for image storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd CarRental
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   ```

4. **Start the development servers**
   
   **Backend** (from `/server` directory):
   ```bash
   npm run dev
   ```
   
   **Frontend** (from `/client` directory):
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 📱 Usage

1. **Customer Flow:**
   - Register/Login to the platform
   - Browse available cars
   - View car details and pricing
   - Make a booking for desired dates
   - Manage bookings in profile

2. **Owner Flow:**
   - Register as a car owner
   - Add car listings with images
   - Manage incoming booking requests
   - View dashboard analytics

## Available Scripts

### Frontend (`/client`)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (`/server`)
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Deployment

The application is configured for deployment on Vercel with separate builds for frontend and backend.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please open an issue in the GitHub repository.

---

Built with/by [Alex](https://github.com/sharky83)
