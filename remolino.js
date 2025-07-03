
const canvas = document.getElementById('remolinoCanvas');
const ctx = canvas.getContext('2d');
let angle = 0;
let spinning = false;
let spinSpeed = 0.05;
let thresholdReached = false;
let audioStarted = false;
const phrases = [
  "Respira hondo",
  "Todo pasa",
  "Eres suficiente",
  "Estás haciendo lo mejor que puedes",
  "Permítete sentir",
  "No estás solo/a",
  "Confía en ti"
];

function drawRemolino() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(angle);

  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.rotate(Math.PI / 4);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 100);
    ctx.strokeStyle = `hsl(${angle * 100}, 70%, 60%)`;
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  ctx.restore();
  angle += spinSpeed;
  if (spinning) {
    requestAnimationFrame(drawRemolino);
  }
}

function createFlyingPhrase() {
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  const el = document.createElement('div');
  el.className = 'phrase';
  el.innerText = phrase;
  el.style.left = Math.random() * 80 + '%';
  el.style.animationDuration = (2 + Math.random() * 3) + 's';
  document.body.appendChild(el);

  setTimeout(() => {
    document.body.removeChild(el);
  }, 5000);
}

function startSpinning() {
  if (!spinning) {
    spinning = true;
    drawRemolino();
  }
}

function initAudio() {
  if (audioStarted) return;
  audioStarted = true;

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const audioContext = new AudioContext();
      const mic = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      mic.connect(analyser);
      analyser.fftSize = 512;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function detectBlow() {
        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((a, b) => a + b) / bufferLength;
        if (volume > 30) {
          spinSpeed = Math.min(1.5, spinSpeed + 0.02);
          createFlyingPhrase();
          if (spinSpeed > 1 && !thresholdReached) {
            thresholdReached = true;
            document.getElementById('mensaje').classList.remove('hidden');
          }
        } else {
          spinSpeed = Math.max(0.05, spinSpeed * 0.98);
        }
        requestAnimationFrame(detectBlow);
      }

      startSpinning();
      detectBlow();
    })
    .catch(err => {
      console.error('No se pudo acceder al micrófono:', err);
    });
}

document.getElementById("startButton").addEventListener("click", initAudio);
