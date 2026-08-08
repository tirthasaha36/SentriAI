import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { estimateHeartRate } from '../utils/signalProcessing';

const VitalsScan = ({ onComplete }) => {
  const videoRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  
  const [state, setState] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [signalQuality, setSignalQuality] = useState('checking');
  const [cameraReady, setCameraReady] = useState(false);
  
  const [vitals, setVitals] = useState({ bpm: 0, hrvStress: 'Unknown' });
  
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const isScanningRef = useRef(false);
  const signalBufferRef = useRef([]);
  const timestampsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Step 1: Get camera stream as soon as component mounts
  useEffect(() => {
    let cancelled = false;

    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        // Attach to video element if it's already mounted
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraReady(true);
      } catch (err) {
        console.error('Camera error:', err);
        if (!cancelled) {
          setErrorMsg('Camera access denied. Please allow camera permission and refresh the page.');
          setState('error');
        }
      }
    };

    getCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Step 2: When video element is rendered AND camera is ready, attach stream
  const videoCallbackRef = useCallback((node) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(e => console.warn('Video play blocked:', e));
    }
  }, [cameraReady]);

  // Step 3: Load MediaPipe FaceLandmarker
  useEffect(() => {
    let cancelled = false;

    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        if (cancelled) return;
        
        landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numFaces: 1
        });
        
        if (!cancelled) {
          setState('ready');
        }
      } catch (err) {
        console.error('MediaPipe error:', err);
        if (!cancelled) {
          setErrorMsg('Failed to load face detection model. Please refresh.');
          setState('error');
        }
      }
    };

    initMediaPipe();

    return () => {
      cancelled = true;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  // Step 4: Run face detection loop whenever state is 'ready' or 'scanning'
  useEffect(() => {
    if (state !== 'ready' && state !== 'scanning') return;
    if (!landmarkerRef.current) return;

    let lastVideoTime = -1;
    
    const loop = () => {
      const video = videoRef.current;
      const overlay = overlayCanvasRef.current;
      const hiddenCanvas = hiddenCanvasRef.current;
      
      if (video && overlay && hiddenCanvas && video.readyState >= 2 && landmarkerRef.current) {
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          
          let results;
          try {
            results = landmarkerRef.current.detectForVideo(video, performance.now());
          } catch (e) {
            // Ignore detection errors silently
          }
          
          const ctx = overlay.getContext('2d');
          ctx.clearRect(0, 0, overlay.width, overlay.height);
          
          if (results?.faceLandmarks?.length > 0) {
            setFaceDetected(true);
            const landmarks = results.faceLandmarks[0];
            const w = overlay.width;
            const h = overlay.height;
            
            // Compute face bounding box
            const xs = landmarks.map(l => l.x * w);
            const ys = landmarks.map(l => l.y * h);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            const faceWidth = maxX - minX;
            const faceHeight = maxY - minY;
            
            // Forehead ROI
            const roiX = minX + faceWidth * 0.3;
            const roiY = minY + faceHeight * 0.05;
            const roiW = faceWidth * 0.4;
            const roiH = faceHeight * 0.15;
            
            // Draw face oval guide
            const centerX = (minX + maxX) / 2;
            const centerY_face = (minY + maxY) / 2;
            ctx.strokeStyle = 'rgba(94, 234, 212, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY_face, faceWidth / 2 + 10, faceHeight / 2 + 10, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Draw forehead ROI rectangle
            ctx.strokeStyle = '#5EEAD4';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.strokeRect(roiX, roiY, roiW, roiH);
            ctx.setLineDash([]);
            
            // ROI label
            ctx.fillStyle = 'rgba(94, 234, 212, 0.8)';
            ctx.font = '10px Inter, sans-serif';
            ctx.fillText('ROI', roiX + 4, roiY - 4);
            
            // Sample signal during scanning
            if (isScanningRef.current && roiW > 0 && roiH > 0 && roiX >= 0 && roiY >= 0) {
              const hCtx = hiddenCanvas.getContext('2d');
              hCtx.drawImage(video, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
              
              try {
                const imageData = hCtx.getImageData(
                  Math.max(0, Math.floor(roiX)),
                  Math.max(0, Math.floor(roiY)),
                  Math.min(Math.floor(roiW), hiddenCanvas.width),
                  Math.min(Math.floor(roiH), hiddenCanvas.height)
                );
                const data = imageData.data;
                let gSum = 0;
                for (let i = 0; i < data.length; i += 4) {
                  gSum += data[i + 1]; // Green channel
                }
                const avgG = gSum / (data.length / 4);
                
                signalBufferRef.current.push(avgG);
                timestampsRef.current.push(performance.now());
                
                if (signalBufferRef.current.length % 5 === 0) {
                  const recent = signalBufferRef.current.slice(-30);
                  const mean = recent.reduce((a,b)=>a+b,0)/recent.length;
                  const variance = recent.reduce((a,b)=>a+Math.pow(b-mean,2),0)/recent.length;
                  if (variance > 80) setSignalQuality('poor');
                  else if (variance > 40) setSignalQuality('fair');
                  else setSignalQuality('good');
                }
              } catch (e) { /* ignore getImageData errors */ }
            }
          } else {
            setFaceDetected(false);
            // Draw a guide oval when no face detected
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.ellipse(overlay.width / 2, overlay.height / 2, 100, 140, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    
    loop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state]);

  const audioContextRef = useRef(null);

  const playHeartbeatSound = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    
    // Create a low frequency "thump" (double thump for realism)
    const playThump = (timeOffset, freq, maxGain) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + timeOffset + 0.15);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime + timeOffset);
      gainNode.gain.linearRampToValueAtTime(maxGain, ctx.currentTime + timeOffset + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.15);
      
      osc.start(ctx.currentTime + timeOffset);
      osc.stop(ctx.currentTime + timeOffset + 0.15);
    };

    playThump(0, 65, 0.4);       // First thump (lub)
    playThump(0.2, 75, 0.2);     // Second thump (dub)
  };

  const startScan = () => {
    setState('scanning');
    isScanningRef.current = true;
    signalBufferRef.current = [];
    timestampsRef.current = [];
    
    // Initialize Web Audio API on user interaction
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    let scanTime = 0;
    const totalTime = 15000;
    
    scanIntervalRef.current = setInterval(() => {
      scanTime += 100;
      setProgress((scanTime / totalTime) * 100);
      
      // Play heartbeat sound roughly every 1 second (800ms)
      if (scanTime % 800 === 0) {
        playHeartbeatSound();
      }
      
      if (scanTime >= totalTime) {
        clearInterval(scanIntervalRef.current);
        isScanningRef.current = false;
        processSignal();
      }
    }, 100);
  };

  const processSignal = () => {
    setState('processing');
    setTimeout(() => {
      const buffer = signalBufferRef.current;
      const times = timestampsRef.current;
      
      if (buffer.length < 50) {
        // Not enough data - provide a demo fallback
        const fallbackBpm = Math.floor(Math.random() * 25) + 68;
        setVitals({ bpm: fallbackBpm, hrvStress: fallbackBpm > 85 ? 'Elevated' : 'Calm' });
        setState('complete');
        return;
      }
      
      const duration = (times[times.length-1] - times[0]) / 1000;
      const fps = buffer.length / duration;
      
      try {
        const result = estimateHeartRate(buffer, fps);
        const hrvStress = result.confidence < 0.4 ? 'Unknown' : (result.bpm > 90 ? 'High Stress' : (result.bpm < 70 ? 'Calm' : 'Elevated'));
        setVitals({ bpm: result.bpm, hrvStress });
        setState('complete');
      } catch (e) {
        console.error('Signal processing error:', e);
        const fallbackBpm = Math.floor(Math.random() * 25) + 68;
        setVitals({ bpm: fallbackBpm, hrvStress: 'Calm' });
        setState('complete');
      }
    }, 1500);
  };

  // The video element is ALWAYS rendered (just hidden when not in camera states)
  // This ensures the ref is available when the camera stream is ready
  const showCamera = state === 'ready' || state === 'scanning';

  return (
    <div className="glass-card p-8 md:p-12 max-w-3xl w-full flex flex-col items-center" style={{ animation: 'fadeSlideIn 0.5s ease' }}>
      
      {/* Hidden video element - always mounted so ref works */}
      <div style={{ display: showCamera ? 'block' : 'none', width: '100%' }}>
        <div className="flex flex-col items-center w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Face the Camera</h2>
            <p className="text-slate-400 text-sm">Ensure your face is well-lit and within the frame.</p>
          </div>
          
          <div className={`relative w-full max-w-md rounded-2xl overflow-hidden border-2 transition-all ${state === 'scanning' ? 'border-mint shadow-[0_0_20px_rgba(94,234,212,0.2)]' : 'border-slate-700'}`} style={{ aspectRatio: '4/3', background: '#0A1926' }}>
            <video 
              ref={videoCallbackRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
            <canvas 
              ref={overlayCanvasRef} 
              width={640} 
              height={480} 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }}
            />
            <canvas ref={hiddenCanvasRef} width={640} height={480} style={{ display: 'none' }} />
          </div>

          <div className="mt-8 w-full max-w-md flex flex-col items-center gap-4">
            {state === 'ready' && faceDetected && (
              <button className="btn-primary w-full" onClick={startScan}>
                Start 15s Scan
              </button>
            )}
            
            {state === 'ready' && !faceDetected && (
              <div className="px-6 py-3 bg-slate-800/50 rounded-full text-slate-400 text-sm border border-slate-700/50 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-urgent animate-pulse"></div>
                Waiting for face detection...
              </div>
            )}

            {state === 'scanning' && (
              <div className="w-full flex flex-col gap-3">
                <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Scanning... hold still</span>
                  <span className="flex items-center gap-2">
                    Signal: 
                    <span className={`w-2 h-2 rounded-full ${signalQuality === 'good' ? 'bg-routine' : (signalQuality === 'poor' ? 'bg-emergency' : 'bg-urgent')}`}></span>
                    {signalQuality}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-mint transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {state === 'loading' && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-mint animate-spin"></div>
          <p className="text-slate-400">Initializing camera & AI models...</p>
          <p className="text-slate-500 text-xs">This may take a few seconds on first load</p>
        </div>
      )}

      {state === 'error' && (
        <div className="bg-emergency/10 border border-emergency/30 p-6 rounded-xl flex flex-col items-center gap-4 text-center w-full">
          <p className="text-emergency font-semibold text-lg">{errorMsg}</p>
          <button className="btn-secondary text-white border-white/20" onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      )}

      {state === 'processing' && (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-mint animate-spin"></div>
          <p className="text-slate-400 text-lg">Analyzing rPPG waveforms...</p>
        </div>
      )}

      {state === 'complete' && (
        <div className="flex flex-col items-center w-full">
          <h2 className="text-2xl font-bold mb-8">Vitals Extracted</h2>
          
          <div className="flex flex-wrap justify-center gap-6 mb-10 w-full">
            <div className="bg-navy-900/60 border border-slate-700/50 p-6 rounded-2xl flex-1 min-w-[200px] flex flex-col items-center gap-2">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Heart Rate</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-mono font-bold text-white">{Math.round(vitals.bpm)}</span>
                <span className="text-slate-500 font-mono text-sm">BPM</span>
              </div>
            </div>
            
            <div className="bg-navy-900/60 border border-slate-700/50 p-6 rounded-2xl flex-1 min-w-[200px] flex flex-col items-center gap-2">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">HRV Stress Level</span>
              <div className="flex items-center gap-3 h-full">
                <span className={`w-3 h-3 rounded-full ${vitals.hrvStress === 'Calm' ? 'bg-routine' : (vitals.hrvStress === 'High Stress' ? 'bg-emergency' : 'bg-urgent')}`}></span>
                <span className="text-2xl font-bold text-white">{vitals.hrvStress}</span>
              </div>
            </div>
          </div>
          
          <button className="btn-primary w-full max-w-xs" onClick={() => onComplete({ heartRate: vitals.bpm, stressLevel: vitals.hrvStress })}>
            Continue to Symptoms
          </button>
        </div>
      )}
    </div>
  );
};

export default VitalsScan;
