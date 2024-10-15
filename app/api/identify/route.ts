// import { NextRequest, NextResponse } from 'next/server';
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// export async function POST(request: NextRequest) {
//   try {
//     const data = await request.formData();
//     const image = data.get('image') as File;

//     if (!image) {
//       return NextResponse.json({ error: 'No image provided' }, { status: 400 });
//     }

//     const imageData = await image.arrayBuffer();
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const prompt = `Identify this plant and provide the following information:
//     1. Common Name
//     2. Scientific Name
//     3. Family
//     4. Description (including appearance, leaves, flowers, and fruit if applicable)
//     5. Native Region
//     6. Uses (medicinal, culinary, ornamental, etc.)
//     7. Interesting Facts
    
//     Please format the response in a structured manner, using the headings above.`;

//     const result = await model.generateContent([
//       prompt,
//       {
//         inlineData: {
//           mimeType: image.type,
//           data: Buffer.from(imageData).toString('base64')
//         }
//       }
//     ]);

//     const response = await result.response;
//     const text = response.text();

//     // Parse the response to extract plant information
//     const plantInfo = parsePlantInfo(text);

//     return NextResponse.json(plantInfo);
//   } catch (error) {
//     console.error('Error processing request:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// function parsePlantInfo(text: string) {
//   const sections = [
//     'Common Name',
//     'Scientific Name',
//     'Family',
//     'Description',
//     'Native Region',
//     'Uses',
//     'Interesting Facts'
//   ];

//   const plantInfo: Record<string, string> = {};

//   sections.forEach((section, index) => {
//     const regex = new RegExp(`${section}:\\s*(.+?)(?=${sections[index + 1] || '$'})`, 's');
//     const match = text.match(regex);
//     plantInfo[section.toLowerCase().replace(' ', '_')] = match ? match[1].trim() : 'Information not available';
//   });

//   return plantInfo;
// }

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const image = data.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const imageData = await image.arrayBuffer();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Identify this plant and provide the following information:
    1. Common Name
    2. Scientific Name
    3. Family
    4. Description (including appearance, leaves, flowers, and fruit if applicable)
    5. Native Region
    6. Uses (medicinal, culinary, ornamental, etc.)
    7. Interesting Facts
    
    Please format the response in a structured manner, using the headings above.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: image.type,
          data: Buffer.from(imageData).toString('base64')
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse the response to extract plant information
    const plantInfo = parsePlantInfo(text);

    return NextResponse.json(plantInfo);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function parsePlantInfo(text: string) {
  const sections = [
    'Common Name',
    'Scientific Name',
    'Family',
    'Description',
    'Native Region',
    'Uses',
    'Interesting Facts'
  ];

  const plantInfo: Record<string, string> = {};

  sections.forEach((section, index) => {
    const regex = new RegExp(`${section}:\\s*(.+?)(?=${sections[index + 1] || '$'})`, 's');
    const match = text.match(regex);
    plantInfo[section.toLowerCase().replace(' ', '_')] = match ? match[1].trim().replace(/\*/g, '') : 'Information not available';
  });

  return plantInfo;
}