export interface DemoPreset {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  imageUrl: string;
  tag: string;
  isMultiProduct?: boolean;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'demo_hoodie',
    title: 'Black Oversized Hoodie',
    subtitle: 'Streetwear heavy fleece',
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    tag: 'Trending Style',
  },
  {
    id: 'demo_sneakers',
    title: 'White Retro Sneakers',
    subtitle: 'Classic low-top trainers',
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    tag: 'Footwear',
  },
  {
    id: 'demo_handbag',
    title: 'Tan Leather Handbag',
    subtitle: 'Structured vegan leather tote',
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    tag: 'Bags',
  },
  {
    id: 'demo_smartwatch',
    title: 'AMOLED Smartwatch',
    subtitle: 'Fitness tracker & caller',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    tag: 'Gadgets',
  },
  {
    id: 'demo_sunglasses',
    title: 'Aviator Sunglasses',
    subtitle: 'Polarized golden wireframe',
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    tag: 'Eyewear',
  },
  {
    id: 'demo_outfit',
    title: 'Streetwear Look (Multi-Item)',
    subtitle: 'Hoodie, Pants, Sneakers & Watch',
    category: 'Multi-Product',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    tag: 'Multi-Product Test',
    isMultiProduct: true,
  },
];
