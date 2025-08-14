# AI Services Setup Guide for OBTASK AI

This guide will help you set up the AI services required for voice transcription and task extraction features.

## 🎯 Overview

OBTASK AI uses three main AI services:
- **AssemblyAI**: For voice transcription
- **Groq/OpenAI**: For AI task extraction
- **Resend**: For email notifications

## 1. AssemblyAI Setup (Voice Transcription)

### Step 1: Create AssemblyAI Account
1. Visit [AssemblyAI.com](https://www.assemblyai.com/)
2. Sign up for a free account
3. Go to your dashboard

### Step 2: Get API Key
1. Navigate to "Your API Keys" in the dashboard
2. Copy your API key
3. Add to your `.env.local` file:
```env
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
```

### Features Enabled:
- Speaker identification
- Auto chapters
- Sentiment analysis
- Entity detection
- Auto highlights
- High-quality transcription

## 2. Groq Setup (AI Task Extraction)

### Step 1: Create Groq Account
1. Visit [Groq.com](https://groq.com/)
2. Sign up for an account
3. Navigate to API Keys section

### Step 2: Get API Key
1. Create a new API key
2. Copy the key
3. Add to your `.env.local` file:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### Model Used:
- `mixtral-8x7b-32768` for high-quality task extraction

## 3. OpenAI Setup (Alternative AI)

If you prefer OpenAI instead of Groq:

### Step 1: Create OpenAI Account
1. Visit [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys

### Step 2: Get API Key
1. Create a new secret key
2. Copy the key
3. Add to your `.env.local` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Model Used:
- `gpt-3.5-turbo` for cost-effective task extraction

## 4. Resend Setup (Email Notifications)

### Step 1: Create Resend Account
1. Visit [Resend.com](https://resend.com/)
2. Sign up for an account
3. Verify your email domain

### Step 2: Get API Key
1. Go to API Keys section
2. Create a new API key
3. Add to your `.env.local` file:
```env
RESEND_API_KEY=your_resend_api_key_here
```

## 5. Complete Environment Variables

Your `.env.local` file should look like this:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Services
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key  # Optional - either Groq or OpenAI

# Email Service
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 How the AI Features Work

### Voice Recording Flow:
1. **Record Meeting**: Up to 2 hours of high-quality audio recording
2. **Upload to AssemblyAI**: Secure audio processing with speaker detection
3. **Get Transcript**: Full transcript with timestamps and speaker labels
4. **AI Analysis**: Extract actionable tasks using Groq/OpenAI
5. **Auto-Create Tasks**: Tasks are automatically added to the selected project

### AI Task Extraction:
- Identifies action items and commitments
- Extracts deadlines and priorities
- Assigns appropriate priority levels (low/medium/high/urgent)
- Creates specific, actionable task descriptions
- Generates meeting summaries

### Smart Features:
- **Speaker Recognition**: Identifies different speakers in meetings
- **Chapter Detection**: Automatically segments long recordings
- **Key Highlights**: Extracts the most important parts
- **Sentiment Analysis**: Understands the tone and urgency
- **Entity Detection**: Identifies names, dates, and important topics

## 💡 Tips for Best Results

### Recording Quality:
- Use a good microphone when possible
- Record in a quiet environment
- Speak clearly and avoid background noise
- Keep recordings under 2 hours for optimal processing

### Task Extraction:
- Mention specific action items clearly
- Include deadlines and assignees when speaking
- Use phrases like "action item", "need to", "should", "must"
- Be specific about what needs to be done

### Example Good Phrases:
- "John needs to complete the report by Friday"
- "Action item: Schedule follow-up meeting with clients"
- "We must review the budget before next week"
- "Sarah will handle the presentation setup"

## 🔧 Testing Your Setup

1. **Create a Project**: Start by creating a project in the Projects page
2. **Record a Test Meeting**: Go to Meetings and record a short test
3. **Check Transcription**: Verify the audio is transcribed correctly
4. **Review Tasks**: Confirm AI-extracted tasks appear in your project
5. **Check Email**: Test the notification system

## 🚨 Troubleshooting

### Common Issues:

**Transcription Fails:**
- Check your AssemblyAI API key
- Ensure audio file is not corrupted
- Verify internet connection

**No Tasks Extracted:**
- Check Groq/OpenAI API keys
- Ensure the transcript contains actionable items
- Try more explicit language in recordings

**Email Not Sending:**
- Verify Resend API key
- Check your domain verification
- Ensure email templates are configured

### Getting Help:
- Check the browser console for error messages
- Verify all environment variables are set
- Test API keys individually using their documentation
- Contact support if issues persist

## 🎉 You're Ready!

Once all services are configured, you can:
- Record meetings up to 2 hours
- Get automatic transcriptions
- Extract actionable tasks with AI
- Manage projects and team collaboration
- Receive smart email notifications

Happy project managing with OBTASK AI! 🚀