
# Flitz Logistics - Transport Management System

A modern web application for managing logistics and transport operations, built with React, TypeScript, and Tailwind CSS.

## Project info

**URL**: https://lovable.dev/projects/8cb05489-9289-492c-98e2-e602bc3f134c

## Quick Start with Docker

The easiest way to run this application is using Docker:

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

### Production Deployment

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Build and start the production container
docker-compose up -d

# The application will be available at http://localhost:8080
```

### Development with Docker

```bash
# Start the development environment
docker-compose --profile dev up

# The development server will be available at http://localhost:8081
# Changes to your code will be automatically reflected
```

### Docker Commands

```bash
# Stop all services
docker-compose down

# View logs
docker-compose logs

# Rebuild containers after code changes
docker-compose up --build

# Remove all containers and volumes
docker-compose down -v
```

## Local Development (without Docker)

If you prefer to run the application locally without Docker:

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Setup Steps

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

## How can I edit this code?

There are several ways of editing your application:

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8cb05489-9289-492c-98e2-e602bc3f134c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

You can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

**Edit a file directly in GitHub**

- Navigate to the desired file(s)
- Click the "Edit" button (pencil icon) at the top right of the file view
- Make your changes and commit the changes

**Use GitHub Codespaces**

- Navigate to the main page of your repository
- Click on the "Code" button (green button) near the top right
- Select the "Codespaces" tab
- Click on "New codespace" to launch a new Codespace environment
- Edit files directly within the Codespace and commit and push your changes once you're done

## Technologies Used

This project is built with:

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn-ui components
- **State Management**: TanStack React Query
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React
- **Containerization**: Docker, Nginx
- **Development**: Hot reload, ESLint, PostCSS

## Project Structure

```
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── docker-compose.yml      # Docker services configuration
├── Dockerfile             # Production Docker build
├── Dockerfile.dev         # Development Docker build
└── nginx.conf             # Nginx configuration for production
```

## Deployment Options

### Deploy with Lovable

Simply open [Lovable](https://lovable.dev/projects/8cb05489-9289-492c-98e2-e602bc3f134c) and click on Share → Publish.

### Deploy with Docker

The application is containerized and ready for deployment on any Docker-compatible platform:

- **Production**: Use `docker-compose up -d` for production deployment
- **Cloud Platforms**: Deploy to AWS ECS, Google Cloud Run, Azure Container Instances, etc.
- **Self-hosted**: Run on your own servers with Docker

### Custom Domain

You can connect a custom domain to your Lovable project:

1. Navigate to Project > Settings > Domains
2. Click Connect Domain
3. Follow the setup instructions

Read more: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Health Monitoring

The application includes health check endpoints:

- **Health Check**: `http://localhost:8080/health`
- **Docker Health**: Automatic container health monitoring
- **Logs**: Access via `docker-compose logs`

## Support

For questions and support:
- [Lovable Documentation](https://docs.lovable.dev/)
- [Lovable Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
