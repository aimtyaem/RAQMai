class StressSimulator {
  constructor() {
    this.stressLevel = 30;
    this.stressInterval = null;
    this.isBreathingExerciseActive = false;
    this.chatHistory = [];
    this.API_KEY = 'AIzaSyB-qg2CY7gGfowh5ITW5PwljgMMXlNKVHg'; // Should use environment variables in real app
  }

  init() {
    this.setupEventListeners();
    this.startStressSimulation();
    this.updateDashboard();
  }

  setupEventListeners() {
    document.getElementById('breathing-btn').addEventListener('click', () => this.performBreathingExercise());
    document.getElementById('oxygen-btn').addEventListener('click', () => this.findOxygenTank());
    document.getElementById('ar-btn').addEventListener('click', () => this.startARBreathing());
    document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
  }

  startStressSimulation() {
    this.stressInterval = setInterval(() => {
      if (this.stressLevel < 100) {
        this.stressLevel = Math.min(this.stressLevel + Math.random() * 2, 100);
        this.updateDashboard();
        this.checkStressWarnings();
      }
    }, 2000);
  }

  performBreathingExercise() {
    if (this.stressLevel > 20 && !this.isBreathingExerciseActive) {
      this.isBreathingExerciseActive = true;
      this.stressLevel = Math.max(this.stressLevel - 20, 0);
      this.addChatMessage("Well done! Stress reduced through breathing exercise.");
      this.updateDashboard();
      setTimeout(() => {
        this.isBreathingExerciseActive = false;
      }, 5000);
    }
  }

  findOxygenTank() {
    this.addChatMessage("Follow the green lights to emergency oxygen supply!");
    // Visual effect simulation
    document.querySelectorAll('.nav-light').forEach(light => {
      light.style.backgroundColor = '#00ff00';
    });
  }

  updateDashboard() {
    // Update stress display
    document.getElementById('stressProgress').style.width = `${this.stressLevel}%`;
    document.getElementById('stressValue').textContent = `${Math.round(this.stressLevel)}%`;

    // Update heart rate
    document.getElementById('bpm').textContent = 
      `${Math.floor(80 + (this.stressLevel * 0.3))} BPM`;
  }

  checkStressWarnings() {
    if (this.stressLevel > 75) {
      this.addChatMessage("Warning: Critical stress levels! Focus on breathing.");
    } else if (this.stressLevel > 50) {
      this.addChatMessage("Stress levels rising. Recommend calming exercises.");
    }
  }

  // AR Breathing Exercise
  async startARBreathing() {
    try {
      await this.simulateAREffects();
      this.addChatMessage("AR Breathing Exercise: Inhale 4s → Hold 6s → Exhale 8s");
      this.showBreathingAnimation();
    } catch (error) {
      this.addChatMessage("AR system unavailable. Try standard breathing exercise.");
    }
  }

  simulateAREffects() {
    return new Promise((resolve) => {
      document.getElementById('ar-overlay').style.display = 'block';
      setTimeout(resolve, 1000);
    });
  }

  // Chat System
  async sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message) return;

    this.addMessage(message, 'user');
    input.value = '';

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `As a stress management expert, provide concise, practical advice. 
                      Current stress level: ${this.stressLevel}%. 
                      User query: ${message}`
              }]
            }]
          })
        }
      );

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      const botResponse = data.candidates[0].content.parts[0].text;
      this.addMessage(botResponse, 'bot');
    } catch (error) {
      this.addMessage("Connection error. Try again later.", 'bot');
    }
  }

  // UI Helpers
  addChatMessage(text) {
    const chatDiv = document.getElementById('chatMessages');
    chatDiv.innerHTML += `<p class="system-message">> ${text}</p>`;
    chatDiv.scrollTop = chatDiv.scrollHeight;
  }

  addMessage(text, sender) {
    const history = document.getElementById('chat-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = `${sender === 'user' ? 'You: ' : 'RA: '}${text}`;
    history.appendChild(messageDiv);
    history.scrollTop = history.scrollHeight;
  }

  showBreathingAnimation() {
    const animationElement = document.getElementById('breathing-animation');
    animationElement.style.display = 'block';
    setTimeout(() => {
      animationElement.style.display = 'none';
    }, 18000); // Match exercise duration
  }
}

// Initialize application
window.addEventListener('DOMContentLoaded', () => {
  const simulator = new StressSimulator();
  simulator.init();
});