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
- Next.js App Router

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
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
