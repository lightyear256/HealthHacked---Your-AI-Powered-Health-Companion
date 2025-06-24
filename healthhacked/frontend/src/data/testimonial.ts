
export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    quote:  "I really appreciate the Care Plan feature, it suggested the right steps for me and helped me track my progress effectively.",
    author: "Naila Kauser",
    role: "M.B.B.S Student",
    rating: 5
  },
  {
    quote: "I like how HealthHacked regularly checks in on my health. It’s comforting to have someone ask about my wellbeing, especially since I’m far from home.",
    author: "Emmanuel",
    role: "B.Tech Student",
    rating: 5
  },
  {
    quote: "I love how it remembers my health journey and provides personalized recommendations. It's like having a health assistant 24/7.",
    author: "Sneha Gupta",
    role: "Working Professional",
    rating: 5
  },
  {
    quote: "The symptom analysis is spot-on and the emergency detection feature gave me peace of mind when I needed it most.",
    author: "Ahmedullah",
    role: "Senior Citizen",
    rating: 5
  },
  {
    quote: "As a busy mom, having 24/7 health support has been a game-changer. Quick, reliable, and always there when I need it.",
    author: "Meera Joshi",
    role: "Mother of Two",
    rating: 5
  },
  {
    quote: "The personalized care plans are amazing. It's like having a personal health coach that adapts to my lifestyle.",
    author: "Rohan Patel",
    role: "Fitness Enthusiast",
    rating: 5
  }
];

// Utility function to create duplicated testimonials for seamless infinite scroll
export const getDuplicatedTestimonials = (): Testimonial[] => [...testimonials, ...testimonials];