// testimonials.ts
export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    quote: "HealthHacked helped me understand my symptoms and guided me to seek the right care. The follow-up reminders keep me on track.",
    author: "Sarah M.",
    role: "Working Professional",
    rating: 5
  },
  {
    quote: "The AI is incredibly smart and compassionate. It felt like talking to a knowledgeable friend who truly cares about my health.",
    author: "Michael R.",
    role: "Student",
    rating: 5
  },
  {
    quote: "I love how it remembers my health journey and provides personalized recommendations. It's like having a health assistant 24/7.",
    author: "Jennifer L.",
    role: "Parent",
    rating: 5
  },
  {
    quote: "The symptom analysis is spot-on and the emergency detection feature gave me peace of mind when I needed it most.",
    author: "David K.",
    role: "Senior Citizen",
    rating: 5
  },
  {
    quote: "As a busy mom, having 24/7 health support has been a game-changer. Quick, reliable, and always there when I need it.",
    author: "Lisa T.",
    role: "Mother of Two",
    rating: 5
  },
  {
    quote: "The personalized care plans are amazing. It's like having a personal health coach that adapts to my lifestyle.",
    author: "Robert J.",
    role: "Fitness Enthusiast",
    rating: 5
  }
];

// Utility function to create duplicated testimonials for seamless infinite scroll
export const getDuplicatedTestimonials = (): Testimonial[] => [...testimonials, ...testimonials];