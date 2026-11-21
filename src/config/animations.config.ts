export interface AnimationConfigEntry {
  enabled: boolean;
  file: string;
  css?: string;
  speed?: number;
  permanent?: boolean;
  starCount?: number;
  cloudCount?: number;
  count?: number;
  duration?: number;
  intensity?: number;
  exitDuration?: number;
}

export const animationsConfig: Record<string, AnimationConfigEntry> = {
  opening: { enabled: true, file: 'opening.ts', css: '/css/animations/opening.css', speed: 1 },
  stars: { enabled: true, file: 'stars.ts', css: '/css/animations/stars.css', permanent: true, starCount: 90, cloudCount: 9 },
  flowers: { enabled: true, file: 'flowers.ts', css: '/css/animations/flowers.css', speed: 1 },
  balloons: { enabled: true, file: 'balloons.ts', css: '/css/animations/balloons.css', count: 10, duration: 11 },
  fireworks: { enabled: true, file: 'fireworks.ts', css: '/css/animations/fireworks.css', intensity: 1 },
  butterflies: { enabled: true, file: 'butterflies.ts', css: '/css/animations/butterflies.css', count: 5 },
  petals: { enabled: true, file: 'petals.ts', css: '/css/animations/petals.css', count: 18 },
  lanterns: { enabled: true, file: 'lanterns.ts', css: '/css/animations/lanterns.css', count: 6 },
  friendship: { enabled: true, file: 'friendship.ts', speed: 1 },
  condolenceLetter: { enabled: true, file: 'condolence-letter.ts', css: '/css/animations/letter.css', exitDuration: 3.2 },
  emotionalScene: { enabled: true, file: 'emotional-scene.ts', speed: 1 },
  personalLetter: { enabled: true, file: 'personal-letter.ts', css: '/css/animations/letter.css', exitDuration: 2.6 },
  finale: { enabled: true, file: 'finale.ts', css: '/css/animations/finale.css', speed: 1 },
  secretMessage: { enabled: true, file: 'secret-message.ts', css: '/css/animations/finale.css', speed: 1 },
  timeJourney: { enabled: true, file: 'time-journey/time-animation.ts', css: '/css/animations/time-journey.css', speed: 1 },
  grandFinale: { enabled: true, file: 'finale/finale-controller.ts', css: '/css/animations/finale.css', speed: 1 }
};
