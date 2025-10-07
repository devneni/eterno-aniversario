export interface Plan {
  id: "no_music" | "with_music" | "eternal";
  title: string;
  photos: number;
  music: boolean;
  priceOriginal: number;
  priceDiscounted: number;
  preferred?: boolean;
  musicTips?: string[];
}

export const plansData: Plan[] = [
  {
    id: "no_music",
    title: "1 ano",
    photos: 3,
    music: false,
    priceOriginal: 14.9,
    priceDiscounted: 9.9,
  },
  {
    id: "with_music",
    title: "1 ano",
    photos: 7,
    music: true,
    priceOriginal: 21.9,
    priceDiscounted: 16.9,
    musicTips: [
      "Ed Sheeran - Perfect",
      "James Arthur - Say You Won't Let Go",
      "Luisa Sonza, Vitão - Flores",
      "Christina Perri - A Thousand Years",
    ],
  },
  {
    id: "eternal",
    title: "Eterno",
    photos: 12,
    music: true,
    priceOriginal: 36.9,
    priceDiscounted: 24.9,
    preferred: true,
    musicTips: [
      "Tiago Iorc - Amei Te Ver",
      "John Legend - All of Me",
      "Jorge & Mateus - Pra Sempre Com Voce",
      "Marisa Monte - Amor I Love You",
    ],
  },
];
