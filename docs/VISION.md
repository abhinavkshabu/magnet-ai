# 🎨 Vision Analysis

Magnet AI includes powerful vision analysis capabilities powered by Google's Gemini Vision models. Analyze images, extract text, detect objects, and understand scenes.

---

## Features

- ✅ **Image Description** - Get detailed descriptions of images
- ✅ **Object Detection** - Identify objects and elements in images
- ✅ **OCR (Text Extraction)** - Extract text from images
- ✅ **Scene Understanding** - Understand context, mood, and atmosphere
- ✅ **Multi-modal Analysis** - Combine text prompts with images
- ✅ **Workflow Integration** - Use vision nodes in workflows
- ✅ **Flexible Input** - Support for URLs, base64, and data URLs

---

## Quick Start

### 1. Standalone API

Analyze images directly via the REST API:

```bash
curl -X POST http://localhost:9002/api/vision/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "prompt": "Describe this image in detail"
  }'
```

**Response:**
```json
{
  "success": true,
  "analysis": "The image shows a beautiful sunset...",
  "metadata": {
    "model": "googleai/gemini-2.0-flash-exp",
    "prompt": "Describe this image in detail",
    "duration": 1234,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. In Workflows

Add a vision node to your workflow:

```typescript
{
  id: 'vision1',
  type: 'vision',
  name: 'Analyze Product Image',
  description: 'Analyze product image for quality',
  position: { x: 100, y: 100 },
  content: {
    imageUrl: 'https://example.com/product.jpg',
    prompt: 'Describe the product quality and any defects',
    model: 'googleai/gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 1000
  }
}
```

---

## API Reference

### POST `/api/vision/analyze`

Analyze an image using Gemini Vision.

**Request Body:**

```typescript
{
  // Image source (required - one of these)
  imageUrl?: string;      // HTTP(S) URL or data URL
  imageData?: string;     // Base64 encoded image
  
  // Analysis parameters (optional)
  prompt?: string;        // Default: "Describe this image in detail."
  model?: string;         // Default: "googleai/gemini-2.0-flash-exp"
  temperature?: number;   // Default: 0.7
  maxTokens?: number;     // Default: 1000
}
```

**Response:**

```typescript
{
  success: boolean;
  analysis: string;       // The AI's analysis
  metadata: {
    model: string;
    prompt: string;
    duration: number;     // milliseconds
    timestamp: string;
  }
}
```

**Error Response:**

```typescript
{
  error: string;
  message?: string;
}
```

---

## Use Cases

### 1. Image Description

```javascript
{
  imageUrl: "https://example.com/photo.jpg",
  prompt: "Describe this image in detail, including colors, objects, and composition."
}
```

### 2. Object Detection

```javascript
{
  imageUrl: "https://example.com/scene.jpg",
  prompt: "List all objects you can identify in this image."
}
```

### 3. OCR (Text Extraction)

```javascript
{
  imageUrl: "https://example.com/document.jpg",
  prompt: "Extract all text from this image, maintaining the original formatting."
}
```

### 4. Product Analysis

```javascript
{
  imageUrl: "https://example.com/product.jpg",
  prompt: "Analyze this product image. Describe the product, its condition, and any visible defects or damage."
}
```

### 5. Scene Understanding

```javascript
{
  imageUrl: "https://example.com/landscape.jpg",
  prompt: "Describe the scene, including the time of day, weather, mood, and atmosphere."
}
```

### 6. Medical Image Analysis

```javascript
{
  imageUrl: "https://example.com/xray.jpg",
  prompt: "Describe any notable features or anomalies in this medical image. Note: This is for educational purposes only."
}
```

### 7. Food Recognition

```javascript
{
  imageUrl: "https://example.com/meal.jpg",
  prompt: "Identify the food items in this image and estimate the ingredients used."
}
```

### 8. Fashion Analysis

```javascript
{
  imageUrl: "https://example.com/outfit.jpg",
  prompt: "Describe the clothing items, colors, style, and suggest similar fashion items."
}
```

---

## Vision Node in Workflows

### Node Configuration

```typescript
{
  id: string;
  type: 'vision';
  name: string;
  description: string;
  position: { x: number; y: number };
  content: {
    imageUrl: string;           // Required: Image URL or data URL
    prompt?: string;            // Optional: Analysis prompt
    model?: string;             // Optional: AI model
    temperature?: number;       // Optional: 0-1
    maxTokens?: number;         // Optional: Max response length
  }
}
```

### Using Variables

You can use variables in `imageUrl` and `prompt`:

```typescript
{
  imageUrl: "{{input.imageUrl}}",
  prompt: "Analyze this {{input.productType}} image"
}
```

**Variable Syntax:**
- `{{input.key}}` - Input data
- `{{nodeId.output}}` - Output from another node
- `{{variable}}` - Workflow variable

### Example Workflow

```typescript
{
  name: "Product Quality Check",
  nodes: [
    {
      id: "webhook1",
      type: "webhook",
      name: "Receive Product Image",
      content: { /* ... */ }
    },
    {
      id: "vision1",
      type: "vision",
      name: "Analyze Quality",
      content: {
        imageUrl: "{{input.imageUrl}}",
        prompt: "Analyze product quality. Rate from 1-10 and list any defects."
      }
    },
    {
      id: "logic1",
      type: "logic",
      name: "Check Quality Score",
      content: {
        condition: "{{vision1.output.text}} contains 'Rating: [8-10]'"
      }
    },
    {
      id: "output1",
      type: "output",
      name: "Return Result",
      content: { format: "json" }
    }
  ],
  connections: [
    { from: "webhook1", to: "vision1" },
    { from: "vision1", to: "logic1" },
    { from: "logic1", to: "output1" }
  ]
}
```

---

## Testing

### Run Vision Tests

```bash
npm run test:vision
```

This will test:
- ✅ Basic image description
- ✅ Object detection
- ✅ Scene understanding
- ✅ Food analysis
- ✅ Vision in workflows

### Manual Testing

```bash
# Start the server
npm run dev

# Test the API
curl -X POST http://localhost:9002/api/vision/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
    "prompt": "What animal is this? Describe its appearance."
  }'
```

---

## Advanced Usage

### Base64 Images

```javascript
const base64Image = "data:image/jpeg;base64,/9j/4AAQSkZJRg...";

await fetch('/api/vision/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageData: base64Image,
    prompt: "Analyze this image"
  })
});
```

### Custom Models

```javascript
{
  imageUrl: "https://example.com/image.jpg",
  prompt: "Describe this image",
  model: "googleai/gemini-2.0-flash-exp",  // Fast and efficient
  temperature: 0.3,  // More focused
  maxTokens: 2000    // Longer response
}
```

### Chaining Vision Nodes

```typescript
// First vision node: Detect objects
{
  id: "vision1",
  type: "vision",
  content: {
    imageUrl: "{{input.imageUrl}}",
    prompt: "List all objects in this image"
  }
}

// Second vision node: Analyze specific object
{
  id: "vision2",
  type: "vision",
  content: {
    imageUrl: "{{input.imageUrl}}",
    prompt: "Focus on the {{vision1.output.text}} and describe it in detail"
  }
}
```

---

## Error Handling

### Common Errors

**1. Invalid Image URL**
```json
{
  "error": "Failed to load image: Failed to fetch image: 404 Not Found"
}
```

**2. No Image Provided**
```json
{
  "error": "Either imageUrl or imageData is required"
}
```

**3. API Key Missing**
```json
{
  "error": "Vision analysis failed",
  "message": "API key not configured"
}
```

### Best Practices

1. **Validate URLs** - Ensure image URLs are accessible
2. **Handle Errors** - Always check for error responses
3. **Optimize Images** - Use reasonable image sizes (< 5MB)
4. **Rate Limiting** - Implement rate limiting for production
5. **Caching** - Cache results for identical requests

---

## Performance

### Typical Response Times

- Small images (< 500KB): 1-2 seconds
- Medium images (500KB - 2MB): 2-4 seconds
- Large images (2MB - 5MB): 4-6 seconds

### Optimization Tips

1. **Resize Images** - Use smaller images when possible
2. **Use CDN** - Host images on a CDN for faster loading
3. **Batch Processing** - Process multiple images in parallel
4. **Cache Results** - Cache analysis results for repeated images

---

## Limitations

- **Max Image Size**: 5MB (recommended)
- **Supported Formats**: JPEG, PNG, GIF, WebP
- **Rate Limits**: Based on Google AI API limits
- **Context Length**: Limited by model's token limit

---

## Examples

See the `scripts/test-vision.ts` file for complete examples:

```bash
npm run test:vision
```

---

## Troubleshooting

### Vision analysis returns empty results

**Cause:** Image URL is not accessible or invalid

**Solution:**
1. Verify the image URL is publicly accessible
2. Check if the image format is supported
3. Try using a data URL instead

### "API key not configured" error

**Cause:** `GOOGLE_GENAI_API_KEY` not set

**Solution:**
1. Add `GOOGLE_GENAI_API_KEY` to `.env.local`
2. Restart the server

### Slow response times

**Cause:** Large images or complex prompts

**Solution:**
1. Resize images before analysis
2. Use more specific prompts
3. Reduce `maxTokens` parameter

---

## Next Steps

- 📖 Read the [Workflow Guide](./WORKFLOWS.md)
- 🔧 Check the [API Documentation](./API.md)
- 🚀 Deploy to production

---

**Happy analyzing! 🎨**
