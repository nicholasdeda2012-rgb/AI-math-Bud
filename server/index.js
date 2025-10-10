require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// API endpoint to solve math problems
app.post('/api/solve', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Convert image to base64
    const imageBase64 = req.file.buffer.toString('base64');
    const imageDataUrl = `data:${req.file.mimetype};base64,${imageBase64}`;

    // Call OpenAI Vision API
    console.log('Calling OpenAI API with image...');
    console.log('Image size:', req.file.size, 'bytes');
    console.log('Image type:', req.file.mimetype);
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert math tutor for middle and high school students. Analyze this math problem image and provide a comprehensive, educational solution.

Please respond with a JSON object containing:
1. "explanation": A clear explanation of what the problem is asking and the approach to solve it
2. "steps": An array of detailed step-by-step solutions that teach the student how to solve it

Guidelines:
- Make explanations clear and educational, suitable for students
- Break down complex problems into manageable steps
- Include mathematical reasoning and concepts
- Use appropriate mathematical notation
- Focus on teaching understanding, not just the answer
- For each step, explain WHY we perform that calculation or operation
- Include the mathematical reasoning behind each step
- If the image is unclear or not a math problem, explain what you see and ask for clarification

IMPORTANT: For each step, include the reasoning behind WHY we do that particular calculation. For example:
- "We factor because..." 
- "We use the zero product property because..."
- "We divide by 3 because..."
- "We add 8 to both sides because..."

Format your response as valid JSON only.`
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    console.log('OpenAI response:', content);
    
    // Try to parse the JSON response
    let solution;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanContent = content;
      if (cleanContent.includes('```json')) {
        cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanContent.includes('```')) {
        cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      solution = JSON.parse(cleanContent);
    } catch (parseError) {
      console.log('Failed to parse JSON, creating structured response from text');
      // If parsing fails, create a structured response from the text
      solution = {
        explanation: "I can see a math problem in the image. Let me help you solve it step by step.",
        steps: [content]
      };
    }

    // Ensure we have the required structure
    if (!solution.steps || !Array.isArray(solution.steps)) {
      solution.steps = [content];
    }
    if (!solution.explanation) {
      solution.explanation = "Here's how to solve this math problem:";
    }

    // Clean up the steps to remove any markdown formatting
    solution.steps = solution.steps.map(step => {
      // Handle both string steps and object steps
      if (typeof step === 'string') {
        return step.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1').trim();
      } else if (typeof step === 'object' && step.step) {
        // Convert object step to formatted string with reasoning and calculations
        let formattedStep = step.step;
        
        // Add calculation if present
        if (step.calculation) {
          formattedStep += `\n📊 ${step.calculation}`;
        }
        
        // Add equation if present
        if (step.equation) {
          formattedStep += `\n📊 ${step.equation}`;
        }
        
        // Add reasoning if present
        if (step.reasoning || step.reason || step.explanation) {
          formattedStep += `\n💡 ${step.reasoning || step.reason || step.explanation}`;
        }
        
        return formattedStep;
      }
      return step;
    });

    res.json(solution);

  } catch (error) {
    console.error('Error solving math problem:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      type: error.type
    });
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Please upload an image smaller than 10MB.' });
    }
    
    if (error.message.includes('Only image files are allowed')) {
      return res.status(400).json({ error: 'Please upload a valid image file.' });
    }

    res.status(500).json({ 
      error: 'Failed to solve the math problem. Please try again or check your image quality.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Math Bud server is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for debugging
app.get('/api/test-openai', async (req, res) => {
  try {
    console.log('Testing OpenAI API...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Hello, this is a test message."
            }
          ]
        }
      ],
      max_tokens: 10
    });
    
    
    res.json({ 
      success: true, 
      message: 'OpenAI API is working',
      response: response.choices[0].message.content
    });
  } catch (error) {
    console.error('OpenAI test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code,
      status: error.status
    });
  }
});

// Chat endpoint for AI tutor conversations
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    console.log('Chat request:', message);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert math tutor for middle and high school students. Your role is to:

1. Help students understand mathematical concepts clearly and simply
2. Provide step-by-step explanations when solving problems
3. Encourage learning and build confidence
4. Ask clarifying questions when needed
5. Provide examples and analogies to make concepts easier to understand
6. Be patient, encouraging, and supportive
7. Focus on teaching understanding, not just giving answers
8. Use appropriate mathematical notation and terminology for the student's level

Guidelines:
- Always explain WHY we do each step in mathematical processes
- Break down complex problems into manageable parts
- Use clear, age-appropriate language
- Provide encouragement and positive reinforcement
- If you're unsure about the student's level, ask clarifying questions
- Suggest practice problems when appropriate
- Connect new concepts to previously learned material when possible

Remember: Your goal is to help the student become confident and independent in their mathematical thinking.`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const aiResponse = response.choices[0].message.content;
    console.log('AI response:', aiResponse);

    res.json({ 
      success: true, 
      response: aiResponse 
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to get response from AI tutor. Please try again.',
      details: error.message 
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 AI Math Bud server running on port ${PORT}`);
  console.log(`📚 Ready to help students solve math problems!`);
});

module.exports = app;
