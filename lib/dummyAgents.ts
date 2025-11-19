export type Agent = {
  id: string;
  name: string;
  country: string;
  specialties: string[];
  rating: number;
  avatar: string;
  bio: string;
};

export const dummyAgents: Agent[] = [
  {
    id: "1",
    name: "Sarah Tan",
    country: "Singapore",
    specialties: ["Sourcing", "Electronics", "QC Inspection"],
    rating: 4.9,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "10+ years helping startups manufacture electronics in Shenzhen."
  },
  {
    id: "2",
    name: "David Chen",
    country: "China (Shenzhen)",
    specialties: ["Tooling", "Injection Moulding", "Prototyping"],
    rating: 4.8,
    avatar: "https://randomuser.me/api/portraits/men/35.jpg",
    bio: "Expert in mould creation, rapid prototyping, and factory matching."
  },
  {
    id: "3",
    name: "Aisha Patel",
    country: "India (Mumbai)",
    specialties: ["Textiles", "Apparel", "Leather Goods"],
    rating: 4.7,
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    bio: "Specialist in small-batch apparel and ethical textile manufacturing."
  },
  {
    id: "4",
    name: "Ben O’Connor",
    country: "Australia",
    specialties: ["Small Batch", "Local Manufacturing", "Packaging"],
    rating: 4.6,
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    bio: "Helps Australian founders produce locally without international chaos."
  }
];