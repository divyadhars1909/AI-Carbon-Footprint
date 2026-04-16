import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// Emission factors
const FACTORS = {
  transport: {
    car: 0.192, // kg CO2 per km
    bike: 0,
    public_transport: 0.041,
  },
  electricity: 0.4, // kg CO2 per kWh
  diet: {
    vegan: 1.0 * 365, // kg CO2 per year
    vegetarian: 1.5 * 365, // kg CO2 per year
    non_vegetarian: 3.3 * 365, // kg CO2 per year
  },
  waste: 0.5, // kg CO2 per kg waste
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.emissions.create.path, async (req, res) => {
    try {
      const input = api.emissions.create.input.parse(req.body);
      
      // Calculate individual emissions
      const transportFactor = FACTORS.transport[input.transportType as keyof typeof FACTORS.transport] ?? 0;
      const transportEmission = input.travelDistance * transportFactor * 365;
      
      const electricityEmission = input.electricityConsumption * FACTORS.electricity * 12;
      
      const dietEmission = FACTORS.diet[input.dietType as keyof typeof FACTORS.diet] ?? 0;
      
      const wasteEmission = input.wasteGeneration * FACTORS.waste * 52;
      
      const totalEmission = transportEmission + electricityEmission + dietEmission + wasteEmission;

      const newEmission = await storage.createEmission({
        travelDistance: input.travelDistance,
        transportType: input.transportType,
        electricityConsumption: input.electricityConsumption,
        dietType: input.dietType,
        wasteGeneration: input.wasteGeneration,
        transportEmission,
        electricityEmission,
        foodEmission: dietEmission,
        wasteEmission,
        totalEmission
      });

      res.status(201).json(newEmission);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.emissions.list.path, async (req, res) => {
    const data = await storage.getEmissions();
    res.json(data);
  });

  // Seed data function to provide realistic examples initially
  async function seedDatabase() {
    try {
      const existing = await storage.getEmissions();
      if (existing.length === 0) {
        const seedData = [
          {
            travelDistance: 20,
            transportType: "car",
            electricityConsumption: 300,
            dietType: "non_vegetarian",
            wasteGeneration: 10,
          },
          {
            travelDistance: 15,
            transportType: "public_transport",
            electricityConsumption: 200,
            dietType: "vegetarian",
            wasteGeneration: 5,
          }
        ];
        
        for (const data of seedData) {
          const transportFactor = FACTORS.transport[data.transportType as keyof typeof FACTORS.transport] ?? 0;
          const transportEmission = data.travelDistance * transportFactor * 365;
          const electricityEmission = data.electricityConsumption * FACTORS.electricity * 12;
          const dietEmission = FACTORS.diet[data.dietType as keyof typeof FACTORS.diet] ?? 0;
          const wasteEmission = data.wasteGeneration * FACTORS.waste * 52;
          const totalEmission = transportEmission + electricityEmission + dietEmission + wasteEmission;
          
          await storage.createEmission({
            ...data,
            transportEmission,
            electricityEmission,
            foodEmission: dietEmission,
            wasteEmission,
            totalEmission
          });
        }
      }
    } catch (error) {
      console.error("Failed to seed database", error);
    }
  }

  // Call seed on start
  seedDatabase().catch(console.error);

  return httpServer;
}
