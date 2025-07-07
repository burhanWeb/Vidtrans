VidTrans – Cloud Video Transcoding System

VidTrans is a full-stack cloud-based video transcoding platform where users can upload videos, which are then processed in the background using FFmpeg and served in multiple formats. The system uses AWS S3 for storage, SQS for job queuing, Docker for service isolation, and Prisma + PostgreSQL for metadata handling.


 Features

Video Upload with authenticated users
Background processing** using AWS SQS
FFmpeg-based transcoding into formats like `.mp4`,
AWS S3 for storing original and transcoded files
Poller + Worker architecture to separate upload and processing
PostgreSQLwith Prisma ORM for user and video metadata
JWT Authentication
- 🐳 Fully **Dockerized** for easy development and deployment

---

System Architecture


User (Frontend)
   ↓
Upload (Backend API)
   ↓
AWS S3 (store original video)
   ↓
AWS SQS (queue job)
   ↓
Poller (listens for new messages)
   ↓
Worker (processes video with FFmpeg)
   ↓
AWS S3 (store transcoded)
   ↓
PostgreSQL (save video info)
   ↓
Frontend (User sees their transcoded videos)
