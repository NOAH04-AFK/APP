import { GoogleGenAI, Type } from "@google/genai";
import { PCComponent, ComponentType } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for Validator Response
const validatorSchema = {
  type: Type.OBJECT,
  properties: {
    compatible: { type: Type.BOOLEAN, description: "True if all components are compatible." },
    issues: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "List of incompatibility issues found. Empty if compatible." 
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Suggestions to improve the build."
    }
  },
  required: ["compatible", "issues"],
};

// Schema for Benchmark Response
const benchmarkSchema = {
  type: Type.OBJECT,
  properties: {
    gamingScore: { type: Type.NUMBER, description: "Score from 0-100 for Gaming" },
    workstationScore: { type: Type.NUMBER, description: "Score from 0-100 for Workstation" },
    bottleneck: { type: Type.STRING, description: "Description of the main bottleneck component" },
    estimatedFPS: { 
      type: Type.ARRAY, 
      items: {
        type: Type.OBJECT,
        properties: {
          game: { type: Type.STRING },
          fps: { type: Type.NUMBER }
        }
      }
    }
  },
  required: ["gamingScore", "workstationScore", "bottleneck"]
};

export const validateBuildWithGemini = async (components: PCComponent[]) => {
  const componentList = components.map(c => `${c.type}: ${c.name} (${c.specs})`).join('\n');
  const prompt = `Analiza la compatibilidad de esta lista de componentes de PC. Verifica socket de CPU/Placa, potencia de fuente, tipo de RAM y espacio físico si es posible.\n\nLista:\n${componentList}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: validatorSchema,
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error validating build:", error);
    return { compatible: false, issues: ["Error de conexión con AI"], recommendations: [] };
  }
};

export const estimatePerformance = async (components: PCComponent[]) => {
  const componentList = components.map(c => `${c.type}: ${c.name}`).join('\n');
  const prompt = `Estima el rendimiento de esta PC basándote en benchmarks conocidos. Dame puntajes y FPS estimados para juegos populares (Cyberpunk 2077, Fortnite, COD).\n\nLista:\n${componentList}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: benchmarkSchema,
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error analyzing benchmarks:", error);
    return null;
  }
};

export const identifyComponentFromImage = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Identifica este componente de hardware de PC. Devuelve un JSON con 'name' (nombre probable del producto), 'type' (tipo de componente ej: GPU, CPU) y 'specs' (especificaciones estimadas). Responde solo JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                specs: { type: Type.STRING }
            }
        }
      }
    });
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error identifying image:", error);
    return null;
  }
};

export const generateForumFeedback = async (build: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Actúa como un usuario experto en un foro de hardware. Da una opinión breve, constructiva y un poco informal sobre esta build:\n${build}`
        });
        return response.text;
    } catch (e) {
        return "¡Se ve interesante! Buen trabajo.";
    }
}