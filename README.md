# Library-System-Backend

This backend repository is part of the Learner's Library project, a comprehensive library management system designed as part of the Enterprise Software Engineering (ESE) module at Ada. This README file provides an overview of the backend structure, database schema, key features, technology stack, used tables, and edge functions.

## Table of Contents

- [Introduction](#introduction)
- [Solution Overview](#solution-overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Used Edge Functions](#used-edge-functions)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)

## Introduction

A robust backend system for managing library operations built with Node.js and Supabase. This system provides a RESTful API interface for library management functionalities. It uses Supabase for database management, PostgreSQL for data storage, and Deno for edge functions.

## Solution Overview

This Library Management System backend provides a complete solution for managing library operations such as, user list, book inventory management, and borrowing processes through Supabase edge-functions.

## Technology Stack

- **Supabase:** Core platform for database, authentication, and serverless functions
- **PostgreSQL:** Database management via Supabase
- **Deno:** Runtime environment for Edge Functions
- **TypeScript:** Programming language for type-safe development
- **CORS:** Enables cross-origin resource sharing

## Features

- Book management (view, add, update)
- Borrowing system with status tracking
- User management with role-based permissions
- Serverless functions for API endpoints

## Used Edge Functions

**Books**

- GET /get-books - Retrieve all books
- POST /get-books - Add a new book
- PUT /get-books - Update book details

**Borrowing**

- GET /borrowed-books - Get all borrowed books and statistics
- POST /borrowed-books - Borrow a book

**Users**

- GET /users - Get all users
- PUT /users - Update user information
- POST /users - Create a new user

## Getting Started

**Prerequisites**

- Supabase account
- Supabase CLI for function deployment
- Deno (for local function development)

**Setup**

1. Clone the repository:

```bash
git clone https://github.com/ilie207/Library-System-Backend.git
```

2. Install dependencies:

```bash
npm install
```

3. Configure Supabase credentials in the `.env` file.

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Login to Supabase.

```bash
supabase login
```

5. Link the local project to Supabase:

```bash
supabase link --project-ref your-project-reference-id
```

6. For local development, you can use:

```bash
supabase start
```

7. Additionally locally you'll need to install Docker.

8. Once you've installed Docker and logged in, you can deploy all functions:

```bash
supabase functions deploy
```

## Database Schema

**The system uses the following main tables:**

- books - Book inventory and availability (id, title, available, author, total_copies, created_at, cover_image, genre, description)
- borrowed_books - Borrowing records and status (id, book_id, user_id, borrowed_date, return_date, actual_return, status)
- users - User information and roles (id, email, f_name, l_name, password, role)

This description highlights the key components, db schema and functionality while providing clear setup instructions.
