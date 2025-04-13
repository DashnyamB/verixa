# Verixa

Verixa is a modern authentication and user management system built with [Bun](https://bun.sh), Prisma, and PostgreSQL. It supports traditional email/password authentication as well as OAuth integrations with providers like Google.

## Features

- **Authentication**: Secure email/password authentication with hashed passwords.
- **OAuth Support**: Seamless integration with Google OAuth.
- **Token Management**: Access and refresh token generation with JWT.
- **Email Verification**: Email-based account verification with token expiration.
- **Scalable Database**: PostgreSQL with Prisma ORM for robust data management.

## Prerequisites

- [Bun](https://bun.sh) v1.2.4 or later
- Node.js (for type definitions)
- PostgreSQL database

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/verixa.git
cd verixa
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env` and update the values as needed:

```bash
cp .env.example .env
```

### 4. Run the Application

Start the development server:

```bash
bun run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Database Setup

Ensure your PostgreSQL database is running. Apply the Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev
```

## Project Structure

```
.
├── prisma/                 # Prisma schema and migrations
├── public/                 # Static assets (HTML, CSS, JS)
├── src/                    # Application source code
│   ├── config/             # Configuration files (e.g., Prisma, environment)
│   ├── controllers/        # Route controllers
│   ├── helpers/            # Utility functions
│   ├── middlewares/        # Middleware functions
│   ├── services/           # Business logic (e.g., JWT service)
├── .env.example            # Example environment variables
├── docker-compose.yml      # Docker configuration for PostgreSQL
├── package.json            # Project metadata and scripts
└── tsconfig.json           # TypeScript configuration
```

## Scripts

- **Development**: `bun run src/app.ts`
- **Debugging**: `bun --inspect ./src/app.ts`

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using [Bun](https://bun.sh), Prisma, and PostgreSQL.
