let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = null;

// Skapa och lägg till inspelningsknapp i Meet UI
function injectRecordButton() {
  const controlsContainer = document.querySelector('[data-meeting-section="controls"]');
  if (!controlsContainer) return;

  const recordButton = document.createElement('button');
  recordButton.className = 'aaims-record-button';
  recordButton.innerHTML = '⚪ Spela in';
  recordButton.onclick = toggleRecording;

  controlsContainer.appendChild(recordButton);
}

async function toggleRecording() {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    startRecording();
  } else if (mediaRecorder.state === 'recording') {
    stopRecording();
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = handleRecordingComplete;

    audioChunks = [];
    mediaRecorder.start();
    recordingStartTime = Date.now();
    
    // Uppdatera UI och meddela AAIMS
    updateRecordButton(true);
    chrome.runtime.sendMessage({
      type: 'RECORDING_STATUS',
      status: 'recording'
    });

  } catch (error) {
    console.error('Error starting recording:', error);
    chrome.runtime.sendMessage({
      type: 'RECORDING_STATUS',
      status: 'error',
      error: error.message
    });
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    updateRecordButton(false);
  }
}

function handleRecordingComplete() {
  const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
  
  // Meddela att inspelningen är klar och transkribering påbörjas
  chrome.runtime.sendMessage({
    type: 'RECORDING_STATUS',
    status: 'processing',
    progress: 0
  });

  // Skicka ljudfilen för transkribering
  uploadAudioForTranscription(audioBlob);
}

function updateRecordButton(isRecording) {
  const button = document.querySelector('.aaims-record-button');
  if (button) {
    button.innerHTML = isRecording ? '🔴 Stoppa' : '⚪ Spela in';
    button.classList.toggle('recording', isRecording);
  }
}

// Initiera när sidan laddas
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectRecordButton);
} else {
  injectRecordButton();
}
