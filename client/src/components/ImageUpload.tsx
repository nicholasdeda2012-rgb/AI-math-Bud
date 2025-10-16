import React, { useState, useRef } from 'react';

interface ImageUploadProps {
  onSubmit: (file: File) => void;
  loading: boolean;
  error: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onSubmit, loading, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  // const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      onSubmit(file);
    } else {
      alert('Please select an image file.');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    // setCapturedImage(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
            onSubmit(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  if (loading) {
    return (
      <div className="upload-container">
        <div className="loading">
          <div className="spinner"></div>
          <div className="loading-text">Analyzing your math problem...</div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
            🤖 Our AI tutor is working hard to provide you with step-by-step solutions
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-container">
      <h2>📸 Upload Your Math Problem</h2>
      <p>Choose an image from your device or take a new photo</p>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div
        className={`upload-area ${dragActive ? 'dragover' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">📁</div>
        <div className="upload-text">Drag & drop your image here</div>
        <div className="upload-subtext">or click to browse files</div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="file-input"
      />

      <div className="button-group">
        <button 
          className="btn btn-primary"
          onClick={() => fileInputRef.current?.click()}
        >
          📁 Choose File
        </button>
        
        {!cameraActive ? (
          <button 
            className="btn btn-secondary"
            onClick={startCamera}
          >
            📷 Take Photo
          </button>
        ) : (
          <button 
            className="btn btn-secondary"
            onClick={stopCamera}
          >
            ❌ Cancel Camera
          </button>
        )}
      </div>

      {cameraActive && (
        <div className="camera-container">
          <video
            ref={videoRef}
            className="camera-preview"
            autoPlay
            playsInline
            muted
          />
          <div className="camera-controls">
            <button 
              className="btn btn-primary"
              onClick={capturePhoto}
            >
              📸 Capture
            </button>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
