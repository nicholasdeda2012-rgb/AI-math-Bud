# AI Math Bud - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp server/.env.example server/.env

# Edit server/.env and add your OpenAI API key:
# OPENAI_API_KEY=your_actual_api_key_here
```

### 3. Start the Application
```bash
# Start both frontend and backend
npm run dev
```

### 4. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 How to Use

1. **Upload an Image**: Click "Choose File" to select a math problem image from your device
2. **Take a Photo**: Click "Take Photo" to use your camera to capture a math problem
3. **Get Solution**: The AI will analyze the image and provide step-by-step solutions
4. **Learn**: Review the explanation and steps to understand the solution

## 🔧 Development

### Frontend (React)
- Located in `client/` directory
- Runs on port 3000
- Hot reload enabled

### Backend (Express.js)
- Located in `server/` directory  
- Runs on port 5000
- Handles image uploads and OpenAI API calls

## 🛠️ Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Make sure you've created `server/.env` with your API key
   - Verify the API key is valid and has credits

2. **Camera not working**
   - Ensure you've granted camera permissions in your browser
   - Try using HTTPS (required for camera access on some browsers)

3. **Image upload fails**
   - Check that the image is under 10MB
   - Ensure the file is a valid image format (JPG, PNG, etc.)

### Getting Help

- Check the browser console for frontend errors
- Check the server console for backend errors
- Verify your OpenAI API key has sufficient credits

## 📚 Features

- ✅ Image upload from device
- ✅ Camera capture for math problems
- ✅ AI-powered problem analysis
- ✅ Step-by-step educational solutions
- ✅ Mobile-responsive design
- ✅ Drag & drop file upload
- ✅ Error handling and validation

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your OpenAI API key secure
- The app processes images locally before sending to OpenAI
