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

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const projectId = formData.get('projectId') as string
    const meetingTitle = formData.get('meetingTitle') as string

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    if (!process.env.ASSEMBLYAI_API_KEY) {
      return NextResponse.json({ error: 'AssemblyAI API key not configured' }, { status: 500 })
    }

    // Convert audio file to buffer
    const audioBuffer = await audioFile.arrayBuffer()
    const audioData = new Uint8Array(audioBuffer)

    // Upload audio to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': process.env.ASSEMBLYAI_API_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: audioData,
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload audio to AssemblyAI')
    }

    const { upload_url } = await uploadResponse.json()

    // Request transcription
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': process.env.ASSEMBLYAI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        speaker_labels: true,
        auto_chapters: true,
        entity_detection: true,
        iab_categories: true,
        sentiment_analysis: true,
        auto_highlights: true,
        punctuate: true,
        format_text: true,
      }),
    })

    if (!transcriptResponse.ok) {
      throw new Error('Failed to request transcription')
    }

    const transcript = await transcriptResponse.json()

    // Store the initial meeting record
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        project_id: projectId,
        title: meetingTitle || 'Recorded Meeting',
        description: 'Meeting recorded via voice recorder',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        created_by: user.id,
        transcript: JSON.stringify({ 
          id: transcript.id, 
          status: 'queued',
          upload_url 
        })
      })
      .select()
      .single()

    if (meetingError) {
      console.error('Error creating meeting:', meetingError)
      return NextResponse.json({ error: 'Failed to create meeting record' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transcriptId: transcript.id,
      meetingId: meeting.id,
      status: transcript.status
    })

  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Failed to process transcription' },
      { status: 500 }
    )
  }
}