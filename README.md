# 🏥 MedCare – Hospital Appointment Booking System

A full-stack hospital appointment booking system that enables patients to book appointments, doctors to manage schedules, and admins to oversee the platform with secure authentication and real-time updates.

---

## 🚀 Features

- 🔐 JWT-based Authentication (Login/Register)
- 👥 Role-Based Access Control (Admin, Doctor, Patient)
- 📅 Real-time Appointment Slot Booking
- 📊 Appointment Status Tracking
- 📧 Automated Email Notifications
- 📄 Downloadable PDF Appointment Confirmations
- 🧑‍⚕️ Doctor Schedule Management
- 🛠️ Admin Dashboard for system control

---

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Tailwind CSS

**Backend:**
- Node.js
- Express.js

**Database:**
- MongoDB

**Authentication:**
- JSON Web Tokens (JWT)

---

## 📂 Project Structure

```
MedCare/
│── frontend/        # React frontend
│── backend/         # Node + Express backend
│── models/          # MongoDB schemas
│── routes/          # API routes
│── controllers/     # Business logic
│── middleware/      # Auth & validation
│── utils/           # Helper functions (email, PDF)
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Tejasreemohan/Hospital-Appointment-Booking-System.git
cd Hospital-Appointment-Booking-System
```

### 2️⃣ Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file and add:
```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

Run backend:
```bash
npm start
```

---

### 3️⃣ Setup Frontend
```bash
cd frontend
npm install
npm start
```

---

## 🔑 API Highlights

- POST /api/auth/register → Register user  
- POST /api/auth/login → Login user  
- GET /api/doctors → Fetch doctors  
- POST /api/appointments → Book appointment  
- GET /api/appointments → View appointments  

---

## 📈 Future Enhancements

- 💳 Online Payment Integration  
- 📱 Mobile App Version  
- 🤖 AI-based Doctor Recommendation  
- 📍 Location-based hospital search  

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork this repo and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Matta Teja Sree**  
GitHub: https://github.com/Tejasreemohan
