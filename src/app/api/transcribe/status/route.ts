import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { transcriptId, meetingId } = await request.json()

    if (!transcriptId || !meetingId) {
      return NextResponse.json({ error: 'Missing transcript ID or meeting ID' }, { status: 400 })
    }

    if (!process.env.ASSEMBLYAI_API_KEY) {
      return NextResponse.json({ error: 'AssemblyAI API key not configured' }, { status: 500 })
    }

    // Check transcription status
    const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: {
        'Authorization': process.env.ASSEMBLYAI_API_KEY,
      },
    })

    if (!statusResponse.ok) {
      throw new Error('Failed to get transcription status')
    }

    const transcriptionData = await statusResponse.json()

    // Update meeting with transcription results
    if (transcriptionData.status === 'completed') {
      // Extract AI insights using Groq or OpenAI
      const aiAnalysis = await extractTasksFromTranscript(transcriptionData.text)

      // Update meeting record
      const { error: updateError } = await supabase
        .from('meetings')
        .update({
          transcript: transcriptionData.text,
          ai_summary: aiAnalysis.summary,
          updated_at: new Date().toISOString()
        })
        .eq('id', meetingId)

      if (updateError) {
        console.error('Error updating meeting:', updateError)
      }

      // Create tasks from AI analysis
      if (aiAnalysis.tasks && aiAnalysis.tasks.length > 0) {
        const { data: meeting } = await supabase
          .from('meetings')
          .select('project_id')
          .eq('id', meetingId)
          .single()

        if (meeting) {
          const tasksToInsert = aiAnalysis.tasks.map((task: any) => ({
            project_id: meeting.project_id,
            title: task.title,
            description: task.description,
            priority: task.priority || 'medium',
            created_by: user.id,
            status: 'todo'
          }))

          const { error: tasksError } = await supabase
            .from('tasks')
            .insert(tasksToInsert)

          if (tasksError) {
            console.error('Error creating tasks:', tasksError)
          }
        }
      }

      return NextResponse.json({
        status: 'completed',
        transcript: transcriptionData.text,
        summary: aiAnalysis.summary,
        tasks: aiAnalysis.tasks,
        chapters: transcriptionData.chapters,
        highlights: transcriptionData.auto_highlights_result?.results
      })
    }

    return NextResponse.json({
      status: transcriptionData.status,
      error: transcriptionData.error
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check transcription status' },
      { status: 500 }
    )
  }
}

async function extractTasksFromTranscript(transcript: string) {
  try {
    // Use Groq API for AI analysis
    if (process.env.GROQ_API_KEY) {
      return await analyzeWithGroq(transcript)
    }
    
    // Fallback to OpenAI
    if (process.env.OPENAI_API_KEY) {
      return await analyzeWithOpenAI(transcript)
    }

    // Fallback: basic keyword extraction
    return extractBasicTasks(transcript)
    
  } catch (error) {
    console.error('AI analysis error:', error)
    return extractBasicTasks(transcript)
  }
}

async function analyzeWithGroq(transcript: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that analyzes meeting transcripts and extracts actionable tasks. 

Return a JSON object with:
- summary: A brief 2-3 sentence summary of the meeting
- tasks: An array of tasks with title, description, and priority (low/medium/high/urgent)

Focus on:
- Action items mentioned
- Decisions that need follow-up
- Deadlines and commitments
- Assignments to people
- Next steps discussed

Each task should be specific and actionable.`
        },
        {
          role: 'user',
          content: `Please analyze this meeting transcript and extract actionable tasks:\n\n${transcript}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    throw new Error('Groq API request failed')
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  try {
    return JSON.parse(content)
  } catch {
    // If JSON parsing fails, create a structured response
    return {
      summary: content.substring(0, 200) + '...',
      tasks: []
    }
  }
}

async function analyzeWithOpenAI(transcript: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that analyzes meeting transcripts and extracts actionable tasks. 

Return a JSON object with:
- summary: A brief 2-3 sentence summary of the meeting
- tasks: An array of tasks with title, description, and priority (low/medium/high/urgent)

Focus on:
- Action items mentioned
- Decisions that need follow-up
- Deadlines and commitments
- Assignments to people
- Next steps discussed

Each task should be specific and actionable.`
        },
        {
          role: 'user',
          content: `Please analyze this meeting transcript and extract actionable tasks:\n\n${transcript}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    throw new Error('OpenAI API request failed')
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  try {
    return JSON.parse(content)
  } catch {
    return {
      summary: content.substring(0, 200) + '...',
      tasks: []
    }
  }
}

function extractBasicTasks(transcript: string): any {
  const actionWords = [
    'need to', 'should', 'must', 'will', 'going to', 'action item',
    'follow up', 'next step', 'deadline', 'due', 'assign', 'responsible'
  ]

  const sentences = transcript.split(/[.!?]+/)
  const tasks = []

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()
    
    if (actionWords.some(word => lowerSentence.includes(word))) {
      const task = {
        title: sentence.trim().substring(0, 100),
        description: sentence.trim(),
        priority: 'medium'
      }
      
      if (lowerSentence.includes('urgent') || lowerSentence.includes('asap')) {
        task.priority = 'urgent'
      } else if (lowerSentence.includes('important')) {
        task.priority = 'high'
      }
      
      tasks.push(task)
    }
  }

  return {
    summary: `Meeting transcript analyzed. ${tasks.length} potential action items identified.`,
    tasks: tasks.slice(0, 10) // Limit to 10 tasks
  }
}