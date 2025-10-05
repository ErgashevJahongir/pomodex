// Browser notification utilities
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showNotification = (
  title: string,
  body: string,
  icon?: string
) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
    });
  }
};

// Audio notification utilities
export const playNotificationSound = (
  soundFile: string = 'boxing_bell',
  volume: number = 70
) => {
  try {
    // Check if audio is allowed (user has interacted with the page)
    const audio = new Audio(`/sounds/notifications/${soundFile}.mp3`);
    audio.volume = Math.max(0, Math.min(1, volume / 100)); // Clamp between 0-1

    // Try to play the sound
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Sound played successfully
        })
        .catch((error) => {
          console.warn('Could not play notification sound:', error);
          // Try to unlock audio context first
          unlockAudioContext().then(() => {
            // Try again after unlocking
            audio.play().catch(() => {
              // Final fallback to Web Audio API
              playFallbackSound();
            });
          });
        });
    }
  } catch (error) {
    console.warn('Could not create audio:', error);
    // Fallback to Web Audio API
    playFallbackSound();
  }
};

// Function to unlock audio context
const unlockAudioContext = async () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    const audioContext = new AudioContextClass();

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    return audioContext;
  } catch (error) {
    console.warn('Could not unlock audio context:', error);
    return null;
  }
};

// Fallback sound using Web Audio API
const playFallbackSound = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('Could not play fallback sound:', error);
  }
};
