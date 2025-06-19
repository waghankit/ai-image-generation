import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import ImageKit from 'imagekit';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  try {
    // Run image generation (returns binary stream)
    const resultStream = (await replicate.run(
      "google/imagen-4",
      {
        input: {
          prompt,
          aspect_ratio: "16:9",
          safety_filter_level: "block_medium_and_above",
        },
      }
    )) as unknown as ReadableStream<Uint8Array>;

    console.log('resultStream...', resultStream)

    // Read binary stream into buffer
    const reader = resultStream.getReader();
    const chunks: Uint8Array[] = [];
    let done = false;
    while (!done) {
      const { value, done: isDone } = await reader.read();
      if (value) chunks.push(value);
      done = isDone;
    }
    const imageBuffer = Buffer.concat(chunks);

    // Upload to ImageKit directly
    const uploadRes = await imagekit.upload({
      file: imageBuffer,
      fileName: `${prompt.replace(/\s+/g, '_')}.png`,
      folder: '/ai-images',
    });

    return NextResponse.json({ imageUrl: uploadRes.url });
  } catch (err: any) {
    console.error("Image generation failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}