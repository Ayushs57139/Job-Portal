# JobWala - Full Stack Job Portal

A complete job portal application built with React Native for cross-platform compatibility and MERN stack backend, providing a modern and intuitive job search experience.

## 🚀 Features

### For Job Seekers
- **User Registration & Authentication** - Secure JWT-based authentication
- **Job Search & Filtering** - Advanced search with filters for location, salary, experience, skills
- **Job Applications** - Apply to jobs with resume upload and cover letter
- **Profile Management** - Complete profile with skills, experience, education
- **Application Tracking** - Track application status and history
- **Resume Management** - Upload and manage resumes

### For Employers
- **Job Posting** - Create and manage job postings
- **Application Management** - View and manage job applications
- **Dashboard Analytics** - Track job performance and application statistics
- **Company Profile** - Manage company information and branding
- **Candidate Screening** - Review applications and update status

### Cross-Platform Features
- **React Native Web** - Runs on web browsers
- **Mobile Apps** - Native iOS and Android apps
- **WebView Integration** - Embedded web browsing capability
- **Responsive Design** - Optimized for all screen sizes

## 🛠 Technology Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **React Native Web** - Web compatibility
- **React Navigation** - Navigation management
- **React Native Vector Icons** - Icon library
- **React Native Linear Gradient** - Gradient backgrounds
- **React Native WebView** - Web content integration
- **AsyncStorage** - Local data persistence

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Multer** - File uploads
- **CORS** - Cross-origin resource sharing

### Additional Libraries
- **Axios** - HTTP client
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **Morgan** - HTTP request logger
- **Compression** - Response compression

## 📱 Screenshots

The app includes the following main screens:
- **Authentication** - Login and Registration
- **Home** - Job listings with search and filters
- **Job Details** - Detailed job information and application
- **Search** - Advanced job search with suggestions
- **Profile** - User profile management
- **Dashboard** - Employer analytics and management
- **Applications** - Job application tracking
- **Post Job** - Job creation and editing
- **WebView** - Integrated web browsing

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd naukri-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the `server` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/naukri-clone
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Start the backend server**
   ```bash
   npm run server
   ```

6. **Start the React Native app**
   ```bash
   # For web
   npm run web
   
   # For Android
   npm run android
   
   # For iOS
   npm run ios
   ```

## 📁 Project Structure

```
naukri-clone/
├── src/
│   ├── components/          # Reusable components
│   │   ├── JobCard.js
│   │   └── FilterModal.js
│   ├── context/            # React Context providers
│   │   ├── AuthContext.js
│   │   └── JobContext.js
│   ├── screens/            # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── HomeScreen.js
│   │   ├── SearchScreen.js
│   │   ├── JobDetailsScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── ApplicationsScreen.js
│   │   ├── PostJobScreen.js
│   │   ├── MyJobsScreen.js
│   │   └── WebViewScreen.js
│   ├── services/           # API services
│   │   └── api.js
│   └── App.js             # Main app component
├── server/
│   ├── config/            # Database configuration
│   │   └── database.js
│   ├── middleware/        # Custom middleware
│   │   └── auth.js
│   ├── models/            # Database models
│   │   ├── User.js
│   │   ├── Job.js
│   │   └── Application.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── users.js
│   │   ├── applications.js
│   │   └── employers.js
│   └── index.js           # Server entry point
├── package.json
├── metro.config.js
├── babel.config.js
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Jobs
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job (Employer)
- `PUT /api/jobs/:id` - Update job (Employer)
- `DELETE /api/jobs/:id` - Delete job (Employer)
- `GET /api/jobs/search/suggestions` - Get search suggestions

### Applications
- `POST /api/applications` - Apply for job
- `GET /api/applications/my-applications` - Get user applications
- `GET /api/applications/job/:jobId` - Get job applications (Employer)
- `PUT /api/applications/:id/status` - Update application status
- `DELETE /api/applications/:id` - Withdraw application

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-resume` - Upload resume
- `POST /api/users/upload-avatar` - Upload avatar
- `GET /api/users/dashboard-stats` - Get dashboard statistics

### Employers
- `GET /api/employers/dashboard` - Get employer dashboard
- `GET /api/employers/analytics` - Get analytics data
- `POST /api/employers/company-profile` - Update company profile
- `GET /api/employers/applications-summary` - Get applications summary

## 🎨 Design Features

- **Naukri.com Color Scheme** - Blue (#1E88E5) primary color
- **Modern UI/UX** - Clean, professional design
- **Responsive Layout** - Works on all screen sizes
- **Gradient Backgrounds** - Beautiful visual elements
- **Card-based Design** - Easy to scan content
- **Intuitive Navigation** - Bottom tab navigation
- **Loading States** - Smooth user experience
- **Error Handling** - User-friendly error messages

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt encryption
- **Input Validation** - Server-side validation
- **CORS Protection** - Cross-origin security
- **Rate Limiting** - API abuse prevention
- **Helmet Security** - HTTP headers protection
- **Data Sanitization** - XSS prevention

## 📱 Platform Support

- **iOS** - Native iOS app
- **Android** - Native Android app
- **Web** - Progressive web app
- **Cross-Platform** - Single codebase for all platforms

## 🚀 Deployment

### Backend Deployment
1. Deploy to Heroku, AWS, or DigitalOcean
2. Set up MongoDB Atlas for production database
3. Configure environment variables
4. Set up file storage (Cloudinary recommended)

### Frontend Deployment
1. **Web**: Deploy to Vercel, Netlify, or AWS S3
2. **Mobile**: Build and publish to App Store and Google Play

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by Naukri.com design and functionality
- Built with React Native and MERN stack
- Uses various open-source libraries and components

## 📞 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Note**: This is a clone/educational project inspired by Naukri.com. It's not affiliated with Naukri.com or its parent company.
