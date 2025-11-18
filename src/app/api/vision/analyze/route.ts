/**
 * Vision Analysis API
 * Analyzes images using Gemini Vision
 */

import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AnalyzeRequest {
  imageUrl?: string;
  imageData?: string; // base64 encoded image
  prompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const {
      imageUrl,
      imageData,
      prompt = 'Describe this image in detail.',
      model = 'googleai/gemini-2.0-flash-exp',
      temperature = 0.7,
      maxTokens = 1000,
    } = body;

    // Validate input
    if (!imageUrl && !imageData) {
      return NextResponse.json(
        { error: 'Either imageUrl or imageData is required' },
        { status: 400 }
      );
    }

    // Prepare image data
    let processedImageData: string;

    if (imageData) {
      // Use provided base64 data
      if (imageData.startsWith('data:')) {
        processedImageData = imageData;
      } else {
        // Assume it's raw base64, add data URL prefix
        processedImageData = `data:image/jpeg;base64,${imageData}`;
      }
    } else if (imageUrl) {
      // Fetch image from URL
      try {
        if (imageUrl.startsWith('data:')) {
          processedImageData = imageUrl;
        } else {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            return NextResponse.json(
              { error: `Failed to fetch image: ${response.statusText}` },
              { status: 400 }
            );
          }

          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const contentType = response.headers.get('content-type') || 'image/jpeg';
          processedImageData = `data:${contentType};base64,${base64}`;
        }
      } catch (error) {
        return NextResponse.json(
          {
            error: `Failed to load image: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Analyze image with Gemini Vision
    const startTime = Date.now();

    const { text } = await ai.generate({
      model,
      prompt: [
        { text: prompt },
        { media: { url: processedImageData } }
      ],
      config: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      analysis: text,
      metadata: {
        model,
        prompt,
        duration,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Vision analysis error:', error);
    return NextResponse.json(
      {
        error: 'Vision analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Vision Analysis API',
    usage: {
      method: 'POST',
      endpoint: '/api/vision/analyze',
      body: {
        imageUrl: 'https://example.com/image.jpg (or data URL)',
        imageData: 'base64 encoded image (optional, alternative to imageUrl)',
        prompt: 'What is in this image? (optional)',
        model: 'googleai/gemini-2.0-flash-exp (optional)',
        temperature: 0.7,
        maxTokens: 1000,
      },
    },
    examples: [
      {
        description: 'Analyze image from URL',
        request: {
          imageUrl: 'https://example.com/photo.jpg',
          prompt: 'Describe this image in detail',
        },
      },
      {
        description: 'Analyze base64 image',
        request: {
          imageData: 'data:image/jpeg;base64,/9j/4AAQ...',
          prompt: 'What objects are in this image?',
        },
      },
      {
        description: 'Extract text from image (OCR)',
        request: {
          imageUrl: 'https://example.com/document.jpg',
          prompt: 'Extract all text from this image',
        },
      },
    ],
  });
}
