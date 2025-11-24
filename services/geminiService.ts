import { GoogleGenAI, Type } from "@google/genai";
import { Grid } from "../types";

const parseSudokuImage = async (file: File): Promise<Grid> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Convert file to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const model = "gemini-2.5-flash"; // Efficient for vision tasks
  
  const prompt = `
    Analyze this image of a Sudoku puzzle. 
    Extract the numbers from the 9x9 grid. 
    Represent empty cells as 0. 
    Return ONLY a JSON object with a 'board' property which is a 9x9 array of numbers.
    Ensure strict accuracy.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            board: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.INTEGER,
                },
              },
            },
          },
          required: ["board"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const json = JSON.parse(text);
    
    // Validate dimensions
    if (Array.isArray(json.board) && json.board.length === 9 && json.board.every((row: any) => Array.isArray(row) && row.length === 9)) {
      return json.board as Grid;
    } else {
      throw new Error("Invalid grid dimensions returned by AI.");
    }
    
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to process image. Please try again or enter manually.");
  }
};

export { parseSudokuImage };