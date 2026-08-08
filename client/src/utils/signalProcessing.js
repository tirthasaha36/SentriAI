/**
 * In-place Cooley-Tukey radix-2 FFT.
 * Input arrays must be Float64Array of power-of-2 length.
 */
export function fft(real, imag) {
  const n = real.length;
  if ((n & (n - 1)) !== 0) throw new Error("Length must be a power of 2");

  // Bit-reversal permutation
  let j = 0;
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      let temp = real[i];
      real[i] = real[j];
      real[j] = temp;
      temp = imag[i];
      imag[i] = imag[j];
      imag[j] = temp;
    }
    let k = n >> 1;
    while (k <= j) {
      j -= k;
      k >>= 1;
    }
    j += k;
  }

  // Cooley-Tukey decimation-in-time radix-2 FFT
  for (let size = 2; size <= n; size *= 2) {
    const halfSize = size / 2;
    const tablestep = n / size;
    for (let i = 0; i < n; i += size) {
      for (let j = i, k = 0; j < i + halfSize; j++, k += tablestep) {
        const l = j + halfSize;
        const angle = -2 * Math.PI * k / n;
        const tcos = Math.cos(angle);
        const tsin = Math.sin(angle);
        
        const tr = real[l] * tcos - imag[l] * tsin;
        const ti = real[l] * tsin + imag[l] * tcos;
        
        real[l] = real[j] - tr;
        imag[l] = imag[j] - ti;
        real[j] += tr;
        imag[j] += ti;
      }
    }
  }
}

/**
 * Inverse FFT
 */
function ifft(real, imag) {
  const n = real.length;
  // Conjugate input
  for (let i = 0; i < n; i++) {
    imag[i] = -imag[i];
  }
  
  fft(real, imag);
  
  // Conjugate output and divide by N
  for (let i = 0; i < n; i++) {
    imag[i] = -imag[i] / n;
    real[i] = real[i] / n;
  }
}

/**
 * Remove linear trend from signal using least-squares fit.
 */
export function detrend(signal) {
  const n = signal.length;
  if (n === 0) return new Float64Array(0);

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += signal[i];
    sumXY += i * signal[i];
    sumX2 += i * i;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return new Float64Array(signal);

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const result = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    result[i] = signal[i] - (slope * i + intercept);
  }
  return result;
}

/**
 * Apply Hamming window.
 */
export function hammingWindow(signal) {
  const n = signal.length;
  const result = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    result[i] = signal[i] * (0.54 - 0.46 * Math.cos(2 * Math.PI * i / (n - 1)));
  }
  return result;
}

/**
 * Pad array to the next power of 2
 */
function padToPowerOf2(signal) {
  const n = signal.length;
  let nextPower = 1;
  while (nextPower < n) nextPower *= 2;
  
  const padded = new Float64Array(nextPower);
  padded.set(signal);
  return padded;
}

/**
 * Simple frequency-domain bandpass.
 */
export function bandpassFilter(signal, sampleRate, lowFreq, highFreq) {
  const paddedReal = padToPowerOf2(signal);
  const n = paddedReal.length;
  const paddedImag = new Float64Array(n);
  
  fft(paddedReal, paddedImag);
  
  const df = sampleRate / n;
  
  for (let i = 0; i < n; i++) {
    let freq = i * df;
    if (i > n / 2) {
      freq = (n - i) * df;
    }
    
    if (freq < lowFreq || freq > highFreq) {
      paddedReal[i] = 0;
      paddedImag[i] = 0;
    }
  }
  
  ifft(paddedReal, paddedImag);
  
  return paddedReal.slice(0, signal.length);
}

/**
 * Calculates signal quality based on variance.
 */
export function getSignalQuality(signal) {
  if (signal.length === 0) return 0;
  
  let mean = 0;
  for (let i = 0; i < signal.length; i++) {
    mean += signal[i];
  }
  mean /= signal.length;
  
  let variance = 0;
  for (let i = 0; i < signal.length; i++) {
    const diff = signal[i] - mean;
    variance += diff * diff;
  }
  variance /= signal.length;
  
  // Heuristic thresholds
  if (variance < 0.001) return 0; // Too low (no face or lighting too dark)
  if (variance > 1000) return 0.1; // Too high (movement artifact)
  
  let quality = 1.0 - (Math.abs(Math.log10(variance) - 1) / 3);
  return Math.max(0, Math.min(1, quality));
}

/**
 * Estimate heart rate from signal.
 */
export function estimateHeartRate(signal, sampleRate) {
  if (signal.length === 0) return { bpm: 0, confidence: 0, spectrum: [] };

  const detrended = detrend(signal);
  const windowed = hammingWindow(detrended);
  const paddedReal = padToPowerOf2(windowed);
  const n = paddedReal.length;
  const paddedImag = new Float64Array(n);
  
  fft(paddedReal, paddedImag);
  
  const df = sampleRate / n;
  let maxMagnitude = 0;
  let peakFreq = 0;
  
  const lowFreq = 0.75; // 45 BPM
  const highFreq = 3.5; // 210 BPM
  
  let sumMagnitudeBand = 0;
  let countBand = 0;
  const spectrum = [];
  
  for (let i = 0; i <= n / 2; i++) {
    const freq = i * df;
    const magnitude = Math.sqrt(paddedReal[i] * paddedReal[i] + paddedImag[i] * paddedImag[i]);
    
    if (freq >= lowFreq && freq <= highFreq) {
      spectrum.push(magnitude);
      sumMagnitudeBand += magnitude;
      countBand++;
      
      if (magnitude > maxMagnitude) {
        maxMagnitude = magnitude;
        peakFreq = freq;
      }
    }
  }
  
  const avgMagnitudeBand = countBand > 0 ? sumMagnitudeBand / countBand : 1;
  const confidence = avgMagnitudeBand > 0 ? Math.min(1, maxMagnitude / (avgMagnitudeBand * 3)) : 0;
  
  return {
    bpm: peakFreq * 60,
    confidence,
    spectrum
  };
}

/**
 * Estimate breathing rate from signal.
 */
export function estimateBreathingRate(signal, sampleRate) {
  if (signal.length === 0) return { rate: 0, confidence: 0 };

  const detrended = detrend(signal);
  const windowed = hammingWindow(detrended);
  const paddedReal = padToPowerOf2(windowed);
  const n = paddedReal.length;
  const paddedImag = new Float64Array(n);
  
  fft(paddedReal, paddedImag);
  
  const df = sampleRate / n;
  let maxMagnitude = 0;
  let peakFreq = 0;
  
  const lowFreq = 0.15; // 9 breaths/min
  const highFreq = 0.5; // 30 breaths/min
  
  let sumMagnitudeBand = 0;
  let countBand = 0;
  
  for (let i = 0; i <= n / 2; i++) {
    const freq = i * df;
    const magnitude = Math.sqrt(paddedReal[i] * paddedReal[i] + paddedImag[i] * paddedImag[i]);
    
    if (freq >= lowFreq && freq <= highFreq) {
      sumMagnitudeBand += magnitude;
      countBand++;
      
      if (magnitude > maxMagnitude) {
        maxMagnitude = magnitude;
        peakFreq = freq;
      }
    }
  }
  
  const avgMagnitudeBand = countBand > 0 ? sumMagnitudeBand / countBand : 1;
  const confidence = avgMagnitudeBand > 0 ? Math.min(1, maxMagnitude / (avgMagnitudeBand * 2)) : 0;
  
  return {
    rate: peakFreq * 60,
    confidence
  };
}
