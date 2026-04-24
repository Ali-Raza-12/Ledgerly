import type { Category, BikeSubType } from "@/types/expense";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "food", name: "Food", icon: "UtensilsCrossed", color: "#22c55e", type: "normal" },
  { id: "travel", name: "Travel", icon: "Plane", color: "#a855f7", type: "normal" },
  { id: "bills", name: "Bills", icon: "Receipt", color: "#f59e0b", type: "normal" },
  { id: "shopping", name: "Shopping", icon: "ShoppingBag", color: "#ec4899", type: "normal" },
  { id: "entertainment", name: "Entertainment", icon: "Film", color: "#06b6d4", type: "normal" },
  { id: "health", name: "Health", icon: "HeartPulse", color: "#ef4444", type: "normal" },
  { id: "bike", name: "Bike", icon: "Bike", color: "#10b981", type: "bike" },
];

export const BIKE_SUBTYPES: { id: BikeSubType; name: string; icon: string; color: string }[] = [
  { id: "petrol", name: "Petrol", icon: "Fuel", color: "#22c55e" },
  { id: "oil", name: "Oil", icon: "Droplets", color: "#f59e0b" },
  { id: "maintenance", name: "Maintenance", icon: "Wrench", color: "#a855f7" },
  { id: "repairs", name: "Repairs", icon: "Hammer", color: "#ef4444" },
];

export const getCategoryById = (cats: Category[], id: string) =>
  cats.find((c) => c.id === id);
