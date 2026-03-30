import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    console.log('[generate-image] Generating with HuggingFace:', prompt);

    const hfResp = await fetch(
      'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
      inputs: prompt,
      parameters: {
        negative_prompt: "text, watermark, logo, blurry, low quality, distorted, people, faces",
        num_inference_steps: 20,
        guidance_scale: 7.5,
        width: 1024,
        height: 576,
      }
    }),
        signal: AbortSignal.timeout(60000),
      }
    );

    console.log('[generate-image] HuggingFace status:', hfResp.status, hfResp.headers.get('content-type'));

    if (!hfResp.ok) {
      const err = await hfResp.text();
      console.error('[generate-image] HuggingFace error:', err);
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const buffer = await hfResp.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', dataUrl);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'ai-course');

    const cloudResp = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const cloudData = await cloudResp.json();
    console.log('[generate-image] Cloudinary response:', cloudData.secure_url);

    if (!cloudData.secure_url) {
      return NextResponse.json({ error: 'Cloudinary upload failed', detail: cloudData }, { status: 500 });
    }

    const imageUrl = cloudData.secure_url.replace(/\.[^/.]+$/, '.jpg');
    return NextResponse.json({ imageUrl });

  } catch (e) {
    console.error('[generate-image] Error:', e?.message || e);
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
