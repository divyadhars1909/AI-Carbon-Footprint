import { db } from "./db";
import { emissions, type InsertEmission, type Emission } from "@shared/schema";

export interface IStorage {
  createEmission(emission: Omit<Emission, "id" | "createdAt">): Promise<Emission>;
  getEmissions(): Promise<Emission[]>;
}

export class DatabaseStorage implements IStorage {
  async createEmission(emissionData: Omit<Emission, "id" | "createdAt">): Promise<Emission> {
    const [emission] = await db.insert(emissions).values(emissionData).returning();
    return emission;
  }

  async getEmissions(): Promise<Emission[]> {
    return await db.select().from(emissions).orderBy(emissions.createdAt);
  }
}

export const storage = new DatabaseStorage();
