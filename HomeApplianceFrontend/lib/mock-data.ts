export type Role = "user" | "provider" | "admin";

export interface Provider {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  distance: string;
  price: number;
  experience: string;
  area: string;
  avatar: string;
  verified: boolean;
  about: string;
}

export interface Booking {
  id: string;
  provider: string;
  service: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  price: number;
}

export interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

export const providers: Provider[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    category: "Electrician",
    rating: 4.8,
    reviews: 142,
    distance: "1.2 km",
    price: 299,
    experience: "8 years",
    area: "Sector 15, Noida",
    avatar: "RK",
    verified: true,
    about: "Certified electrician with 8 years of residential and commercial experience. Specializes in wiring, installations, and repairs.",
  },
  {
    id: "2",
    name: "Suresh Patel",
    category: "Plumber",
    rating: 4.6,
    reviews: 98,
    distance: "2.4 km",
    price: 349,
    experience: "6 years",
    area: "Indiranagar, Bangalore",
    avatar: "SP",
    verified: true,
    about: "Expert plumber with 6 years of experience handling tap repairs, pipe leakages, and bathroom fittings.",
  },
  {
    id: "3",
    name: "Amit Sharma",
    category: "Electrician",
    rating: 4.5,
    reviews: 76,
    distance: "3.1 km",
    price: 249,
    experience: "5 years",
    area: "Koramangala, Bangalore",
    avatar: "AS",
    verified: false,
    about: "Skilled electrician offering affordable and reliable electrical services for homes and offices.",
  },
  {
    id: "4",
    name: "Vikram Singh",
    category: "Plumber",
    rating: 4.9,
    reviews: 211,
    distance: "0.8 km",
    price: 399,
    experience: "10 years",
    area: "HSR Layout, Bangalore",
    avatar: "VS",
    verified: true,
    about: "Top-rated plumber with a decade of experience. Available 24/7 for emergency plumbing needs.",
  },
];

export const userBookings: Booking[] = [
  {
    id: "B001",
    provider: "Rajesh Kumar",
    service: "Fan Installation",
    date: "May 3, 2025",
    time: "10:00 AM",
    status: "upcoming",
    price: 299,
  },
  {
    id: "B002",
    provider: "Suresh Patel",
    service: "Tap Repair",
    date: "Apr 20, 2025",
    time: "02:00 PM",
    status: "completed",
    price: 349,
  },
  {
    id: "B003",
    provider: "Vikram Singh",
    service: "Pipe Leakage Fix",
    date: "Mar 15, 2025",
    time: "11:00 AM",
    status: "completed",
    price: 399,
  },
];

export const providerBookings: Booking[] = [
  {
    id: "B101",
    provider: "Anita Mehta",
    service: "Switch Repair",
    date: "Apr 29, 2025",
    time: "09:00 AM",
    status: "upcoming",
    price: 199,
  },
  {
    id: "B102",
    provider: "Priya Nair",
    service: "Fan Installation",
    date: "Apr 29, 2025",
    time: "12:00 PM",
    status: "upcoming",
    price: 299,
  },
  {
    id: "B103",
    provider: "Ravi Teja",
    service: "Wiring Fix",
    date: "Apr 28, 2025",
    time: "03:00 PM",
    status: "completed",
    price: 450,
  },
];

export const notifications: Notification[] = [
  { id: "1", message: "Booking confirmed for Fan Installation on May 3", time: "2h ago", read: false },
  { id: "2", message: "Rajesh Kumar accepted your service request", time: "5h ago", read: false },
  { id: "3", message: "Service reminder: Tap Repair tomorrow at 2 PM", time: "1d ago", read: true },
  { id: "4", message: "Your review has been posted successfully", time: "2d ago", read: true },
];

export const electricianServices = [
  { id: "e1", name: "Fan Installation", price: 299, duration: "1 hr" },
  { id: "e2", name: "Switch Repair", price: 149, duration: "30 min" },
  { id: "e3", name: "Wiring Fix", price: 499, duration: "2 hrs" },
];

export const plumberServices = [
  { id: "p1", name: "Tap Repair", price: 199, duration: "30 min" },
  { id: "p2", name: "Pipe Leakage Fix", price: 349, duration: "1 hr" },
  { id: "p3", name: "Toilet Repair", price: 449, duration: "1.5 hrs" },
];

export const adminStats = {
  totalUsers: 1842,
  totalProviders: 312,
  activeBookings: 94,
  totalRevenue: 284500,
};

export const pendingProviders = [
  { id: "P01", name: "Deepak Verma", category: "Electrician", submitted: "Apr 27, 2025" },
  { id: "P02", name: "Mona Singh", category: "Plumber", submitted: "Apr 26, 2025" },
  { id: "P03", name: "Harish Reddy", category: "Electrician", submitted: "Apr 25, 2025" },
];

export const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM",
  "03:00 PM", "04:00 PM", "05:00 PM",
];

export const providerServices = [
  { id: "s1", name: "Fan Installation", price: 299, duration: "1 hr", active: true },
  { id: "s2", name: "Switch Repair", price: 149, duration: "30 min", active: true },
  { id: "s3", name: "Wiring Fix", price: 499, duration: "2 hrs", active: false },
];

export const reviews = [
  { id: "r1", user: "Anita M.", rating: 5, comment: "Excellent work! Very professional and on time.", date: "Apr 20, 2025" },
  { id: "r2", user: "Rohan G.", rating: 4, comment: "Good service, fixed the issue quickly.", date: "Apr 10, 2025" },
  { id: "r3", user: "Priya K.", rating: 5, comment: "Highly recommended. Will book again!", date: "Mar 28, 2025" },
];
