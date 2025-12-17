# DevTasker - Agile Board for Team Productivity

> **Plan smarter. Ship faster. Stay aligned.**

DevTasker is a Jira-style task and project management platform focused on agile teams. It features Kanban boards with drag-and-drop functionality, role-based access control, real-time updates via SignalR, and a clean enterprise UI.

![DevTasker Screenshot](./docs/screenshot.png)

## 🚀 Features

### Core Features

- 🧩 **Kanban Boards** - Visual task management with customizable columns
- 🔄 **Drag & Drop** - Smooth task movement with real-time sync
- 👥 **Team Collaboration** - Invite team members and assign tasks
- 🔐 **Role-Based Permissions** - Admin, Project Manager, and Team Member roles
- 🧠 **Activity Timeline** - Track all changes to tasks
- ⚡ **Real-Time Updates** - See changes instantly across all clients

### Admin Features

- User management
- Project analytics
- Access control

### Additional Features

- 🌙 Dark mode
- 🏷️ Task labels
- 💬 Comments
- 📊 Story points
- 📅 Due dates

## 🧱 Tech Stack

### Frontend

- **SolidJS** - Reactive UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **TypeScript** - Type safety
- **@solidjs/router** - Client-side routing
- **@microsoft/signalr** - Real-time communication

### Backend

- **ASP.NET Core 9.0** - Web API
- **Entity Framework Core** - ORM
- **ASP.NET Identity** - Authentication
- **JWT** - Token-based auth
- **SignalR** - Real-time updates
- **SQLite** (dev) / **SQL Server** (production)

## 📦 Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (recommended) or npm

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/devtasker.git
cd devtasker
```

### 2. Backend Setup

```bash
cd backend

# Restore packages
dotnet restore

# Run the API (creates database automatically)
dotnet run
```

The API will be available at `http://localhost:5116`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 Configuration

### Backend (`backend/appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=devtasker.db"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyHere",
    "Issuer": "DevTasker",
    "Audience": "DevTaskerApp"
  }
}
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5116/api
VITE_HUB_URL=http://localhost:5116/hubs/board
```

## 📁 Project Structure

```
devtasker/
├── backend/
│   ├── Controllers/      # API endpoints
│   ├── Services/         # Business logic
│   ├── Models/
│   │   ├── Entities/     # Database entities
│   │   ├── DTOs/         # Data transfer objects
│   │   └── Requests/     # API request models
│   ├── Data/             # DbContext & migrations
│   ├── Hubs/             # SignalR hubs
│   ├── Middleware/       # Error handling
│   └── Program.cs        # App configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── stores/       # State management
│   │   ├── services/     # API & SignalR services
│   │   └── types.ts      # TypeScript types
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── README.md
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh token |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Boards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards/project/:projectId` | List project boards |
| POST | `/api/boards` | Create board |
| GET | `/api/boards/:id` | Get board with columns & tasks |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PUT | `/api/tasks/:id/move` | Move task (drag & drop) |
| DELETE | `/api/tasks/:id` | Delete task |

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, user management |
| **Project Manager** | Create/manage projects & boards |
| **Team Member** | Create/edit tasks, comment |

## 🚀 Deployment

### Frontend (Netlify)

1. Connect your GitHub repository to Netlify
2. Set build command: `pnpm build`
3. Set publish directory: `dist`
4. Add environment variables

### Backend (Azure App Service)

1. Create an Azure App Service (.NET 9.0)
2. Configure connection string for Azure SQL
3. Deploy via GitHub Actions or Azure CLI

## 🧪 Development

### Running Tests

```bash
# Backend unit tests
cd backend
dotnet test DevTasker.Tests

# Frontend (if tests are set up)
cd frontend
pnpm test
```

### Building for Production

```bash
# Backend
dotnet publish -c Release

# Frontend
pnpm build
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**DevTasker** - Built with ❤️ for agile teams
