import { NextResponse } from 'next/server'
import { join } from 'path'
import { writeFile, readFile } from 'fs/promises'
import { spawn } from 'child_process'
import { AUDIO_CONFIG, ERROR_MESSAGES, type AudioMetadata } from '@/config/audio'

export async function POST(request: Request) {
  try {
    const { files, outputName } = await request.json()

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.CONCATENATE.NO_FILES },
        { status: 400 }
      )
    }

    if (!outputName || !/^[a-zA-Z0-9-_ ]+\.(mp3|wav)$/i.test(outputName)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.CONCATENATE.INVALID_OUTPUT },
        { status: 400 }
      )
    }

    const audioDir = join(process.cwd(), 'public', 'audio')
    const outputPath = join(audioDir, outputName)
    const metadataPath = join(audioDir, 'metadata.json')

    // Create a temporary file list for FFmpeg
    const fileList = files
      .map(file => `file '${join(audioDir, file)}'`)
      .join('\n')
    
    const listPath = join(audioDir, 'temp_list.txt')
    await writeFile(listPath, fileList)

    // Execute FFmpeg to concatenate files
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-f', 'concat',
        '-safe', '0',
        '-i', listPath,
        '-c', 'copy',
        outputPath
      ])

      let error = ''

      ffmpeg.stderr.on('data', (data) => {
        error += data.toString()
      })

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(true)
        } else {
          reject(new Error(`FFmpeg failed with code ${code}: ${error}`))
        }
      })
    })

    // Update metadata
    let metadata: AudioMetadata = {
      categories: AUDIO_CONFIG.storage.categories,
      files: {}
    }

    try {
      const content = await readFile(metadataPath, 'utf-8')
      metadata = JSON.parse(content)
    } catch {
      // If metadata file doesn't exist, use default structure
    }

    // Add concatenated file to metadata
    metadata.files[outputName] = {
      category: 'Annonces',
      createdAt: new Date().toISOString()
    }

    // Save updated metadata
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2))

    // Clean up temporary file list
    try {
      await unlink(listPath)
    } catch (error) {
      console.error('Error cleaning up temp file:', error)
    }

    return NextResponse.json({
      success: true,
      message: 'Fichiers audio concaténés avec succès',
      outputPath: `${AUDIO_CONFIG.storage.basePath}/${outputName}`
    })
  } catch (error) {
    console.error('Error concatenating files:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.CONCATENATE.GENERIC },
      { status: 500 }
    )
  }
}

import { unlink } from 'fs/promises'
