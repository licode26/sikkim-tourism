/* tslint:disable */
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI} from '@google/genai';

// Correct initialization according to guidelines
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      resolve(url.split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });
}

async function generateContent(prompt: string, imageBytes: string | null) {
  // Configuration for the video generation
  const config: any = {
    model: 'veo-2.0-generate-001', // Correct model name
    prompt,
    config: {
      numberOfVideos: 1,
    },
  };

  if (imageBytes) {
    config.image = {
      imageBytes,
      mimeType: 'image/png', // Assuming png, could be dynamic
    };
  }

  let operation = await ai.models.generateVideos(config);

  const statusEl = document.querySelector('#status') as HTMLDivElement;
  let dots = 1;
  while (!operation.done) {
    const waitingMessage = `Generating, please wait${'.'.repeat(dots)}`;
    console.log(waitingMessage);
    statusEl.innerText = waitingMessage;
    dots = (dots % 3) + 1;
    await delay(10000); // Poll for video operation status
    operation = await ai.operations.getVideosOperation({operation});
  }

  const videos = operation.response?.generatedVideos;
  if (videos === undefined || videos.length === 0) {
    throw new Error('No videos generated');
  }

  videos.forEach(async (v, i) => {
    // Appending API key to the URI is required
    const url = `${v.video.uri}&key=${process.env.API_KEY}`;
    const res = await fetch(url);
    const blob = await res.blob();
    const objectURL = URL.createObjectURL(blob);
    
    // Instead of auto-download, show in video player
    const video = document.querySelector('#video') as HTMLVideoElement;
    video.src = objectURL;
    video.style.display = 'block';
    console.log(`Video ${i} is ready to play.`);
  });
}

// Get references to new DOM elements
const uploadInput = document.querySelector('#file-input') as HTMLInputElement;
const promptEl = document.querySelector('#prompt-input') as HTMLTextAreaElement;
const generateButton = document.querySelector('#generate-button') as HTMLButtonElement;
const statusEl = document.querySelector('#status') as HTMLDivElement;
const video = document.querySelector('#video') as HTMLVideoElement;
const imgPreview = document.querySelector('#img-preview') as HTMLImageElement;
const errorModal = document.querySelector('#error-modal') as HTMLDivElement;
const errorMessageContainer = document.querySelector('#error-message-container') as HTMLDivElement;
const modalAddKeyButton = document.querySelector('#modal-add-key-button') as HTMLButtonElement;
const modalCloseButton = document.querySelector('#modal-close-button') as HTMLButtonElement;

let base64data: string | null = null;
let prompt = '';

// Event Listeners
uploadInput.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files[0];
  if (file) {
    base64data = await blobToBase64(file);
    // Show image preview
    imgPreview.src = URL.createObjectURL(file);
    imgPreview.style.display = 'block';
  } else {
    base64data = null;
    imgPreview.style.display = 'none';
  }
});

promptEl.addEventListener('input', () => {
  prompt = promptEl.value;
});

generateButton.addEventListener('click', () => {
  if (prompt.trim() === '') {
    alert('Please enter a prompt to generate a video.');
    return;
  }
  generate();
});

modalCloseButton.addEventListener('click', () => {
  errorModal.style.display = 'none';
});

modalAddKeyButton.addEventListener('click', async () => {
  // API key management must be handled externally.
  alert('Please ensure your API key is configured correctly in your environment.');
  errorModal.style.display = 'none';
});

// Helper Functions
function showErrorModal(messages: string[]) {
  errorMessageContainer.innerHTML = '';
  messages.forEach((msg) => {
    const p = document.createElement('p');
    p.textContent = msg;
    errorMessageContainer.appendChild(p);
  });
  errorModal.style.display = 'flex';
}

function setUIState(isGenerating: boolean) {
    generateButton.disabled = isGenerating;
    uploadInput.disabled = isGenerating;
    promptEl.disabled = isGenerating;
    generateButton.innerText = isGenerating ? 'Generating...' : 'Generate Video Tour';
}

// Main Generate Function
async function generate() {
  statusEl.innerText = 'Starting generation...';
  video.style.display = 'none';
  setUIState(true);

  try {
    await generateContent(prompt, base64data);
    statusEl.innerText = 'Done. Your video is ready.';
  } catch (e) {
    console.error('Video generation failed:', e);
    // Generic error message
    showErrorModal([
        'Video generation failed.',
        'This may be due to an invalid API key or a problem with the service. Please check your setup and try again.'
    ]);
    statusEl.innerText = 'Error generating video.';
  }

  setUIState(false);
}
