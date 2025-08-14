# OBTASK AI - AI-Powered Project Manager

An intelligent project management application with voice recording, task automation, and AI insights.

## Features

- 🎯 **Smart Project Management**: Create and manage projects with intelligent task organization
- 🎤 **Voice Recording**: Record meetings up to 2 hours with automatic transcription
- 🤖 **AI Task Extraction**: Automatically create tasks from meeting recordings
- 📊 **AI Insights**: Get intelligent project health analysis and recommendations
- 👥 **Team Collaboration**: Invite team members and assign tasks
- 📱 **Mobile-First Design**: Responsive design optimized for mobile devices
- 🗓️ **Calendar Integration**: Schedule meetings and track deadlines
- 📧 **Smart Notifications**: AI-powered email notifications and daily digests

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI Services**: 
  - AssemblyAI for voice transcription
  - Groq/OpenAI for AI features
  - Resend for email notifications
- **Deployment**: Vercel

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/vipervv3/obaitask.git
cd obaitask
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Services
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key

# Email Service
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
3. Update your environment variables with your Supabase credentials

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The application uses the following main tables:

- **profiles**: User profiles and settings
- **projects**: Project information and metadata
- **project_members**: Project team members and roles
- **tasks**: Task management with status and assignments
- **meetings**: Meeting records with transcriptions
- **meeting_attendees**: Meeting participant tracking

## API Integration Setup

### AssemblyAI (Voice Transcription)
1. Sign up at [AssemblyAI](https://www.assemblyai.com/)
2. Get your API key from the dashboard
3. Add it to your `.env.local` file

### Groq (AI Features)
1. Sign up at [Groq](https://groq.com/)
2. Get your API key
3. Add it to your `.env.local` file

### Resend (Email Notifications)
1. Sign up at [Resend](https://resend.com/)
2. Get your API key
3. Add it to your `.env.local` file

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## Core Features Implementation

### Voice Recording & AI Task Creation
1. Record meetings using the browser's MediaRecorder API
2. Upload audio to AssemblyAI for transcription
3. Process transcripts with Groq/OpenAI to extract actionable tasks
4. Automatically create tasks in the selected project

### AI Insights
- Daily project health analysis
- Task completion predictions
- Workload balancing suggestions
- Meeting insights from recordings
- Smart deadline recommendations

### Notification System
- Morning briefings with AI insights
- Task deadline alerts
- Meeting reminders
- End-of-day summaries
- Proactive risk alerts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
