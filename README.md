# Next LMS — Learning Management System

A modern Learning Management System built with Next.js, React, Tailwind CSS, MongoDB, and Clerk. The platform is designed for creating, managing, and consuming online courses with authentication, video lessons, course progress, payments, and media management.

## Features

- Course creation and management
- Video-based lessons
- Student learning experience
- Instructor and course management
- Authentication with Clerk
- Protected routes
- Stripe payment integration
- Course and learning progress
- Rich text content editing
- Image and file uploads
- AWS S3 and UploadThing integration
- Drag-and-drop course organization
- Form handling with React Hook Form
- Validation with Zod
- MongoDB and Mongoose
- Responsive design

## Clerk roles

New Clerk users are automatically assigned the least-privileged `student` role
when they first open the app. Set `publicMetadata.role` in the Clerk Dashboard
to `teacher` or `admin` to grant access to teacher mode. Users without a role
are treated as students by the application.
- Next.js App Router

## Development

Requires Node.js 20.9 or newer. This project uses Next.js 16 and React 19.

```sh
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

Authentication runs in `proxy.ts` using Clerk middleware. Server-side auth,
route parameters, and request headers use the asynchronous APIs.

The optional UploadThing integration uses v7 and requires `UPLOADTHING_TOKEN`
from the UploadThing dashboard. Legacy `UPLOADTHING_SECRET` and
`UPLOADTHING_APP_ID` settings are no longer used. The course editor's S3
image, attachment, and video uploads continue to use the existing S3 settings.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Clerk
- MongoDB
- Mongoose
- Stripe
- Mux
- AWS S3
- UploadThing
- React Hook Form
- Zod
- Zustand
# MongoDB
MONGODB_URI=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Stripe
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=

# Mux
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=

# UploadThing
UPLOADTHING_TOKEN=
