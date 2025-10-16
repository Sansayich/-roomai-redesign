import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Replicate from 'replicate'
import { saveGeneratedImages } from '@/lib/imageStorage'
import { randomBytes } from 'crypto'

// Инициализация Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
})

const QUALITY_CREDITS: Record<string, number> = {
  best: 2,
  good: 1,
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { image, styles, roomType, quality } = body

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      )
    }

    if (!styles || styles.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one style' },
        { status: 400 }
      )
    }

    // Проверяем кредиты пользователя
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    })

    const creditsPerStyle = QUALITY_CREDITS[quality] || 1
    const totalCreditsNeeded = creditsPerStyle * styles.length

    if (!user || user.credits < totalCreditsNeeded) {
      return NextResponse.json(
        { error: 'Not enough credits' },
        { status: 400 }
      )
    }

    // Проверка наличия API ключа
    if (!process.env.REPLICATE_API_TOKEN) {
      console.warn('REPLICATE_API_TOKEN не установлен, возвращаю mock данные')
      
      // Mock ответ для тестирования без API ключа
      const mockOutputs = styles.map(() => image) // Возвращаем оригинальное изображение
      
      return NextResponse.json({
        outputs: mockOutputs,
        message: 'Mock режим: добавьте REPLICATE_API_TOKEN в .env для реальной генерации'
      })
    }

    // Генерация изображений для каждого стиля
    const outputs: string[] = []

    for (const styleId of styles) {
      try {
        // Используем модель для редизайна интерьеров
        let output: any
        
        // Используем только nano banana для всех генераций
        const model = 'google/nano-banana'
        
        output = await replicate.run(
          model as any,
          {
            input: {
              prompt: getStylePrompt(styleId).replace('{room_type}', getRoomTypePrompt(roomType)),
              image_input: [image],
              strength: 0.8,
              guidance_scale: 9.0,
              num_inference_steps: 50,
              width: 1024, // Aspect ratio 4:3
              height: 768,
              format: 'png', // PNG формат
            },
          }
        )
        
        // Nano banana возвращает объект с методом url()
        if (output && typeof output.url === 'function') {
          outputs.push(output.url())
        } else if (Array.isArray(output) && output.length > 0) {
          outputs.push(output[0] as string)
        } else if (typeof output === 'string') {
          outputs.push(output)
        }

        // Небольшая задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (styleError) {
        console.error(`Generation error for style ${styleId}:`, styleError)
        // Continue generating other styles
      }
    }

    if (outputs.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate images' },
        { status: 500 }
      )
    }

    // Определяем, нужно ли сохранять изображения на сервере
    // Только для тарифа "Популярный" (100 кредитов) сохраняем на 30 дней
    const shouldSaveLocally = user.credits >= 100 // Пользователи с большими тарифами получают постоянное хранение
    
    let savedImages: { originalUrl: string; generatedUrls: string[] }
    
    if (shouldSaveLocally) {
      // Сохраняем изображения локально для премиум-пользователей
      try {
        const generationId = randomBytes(16).toString('hex')
        savedImages = await saveGeneratedImages(image, outputs, generationId)
        console.log('Images saved locally for premium user')
      } catch (saveError) {
        console.error('Error saving images locally:', saveError)
        // Если не удалось сохранить локально, используем временные URL
        savedImages = { originalUrl: image, generatedUrls: outputs }
      }
    } else {
      // Для обычных тарифов используем временные URL от Replicate (24-48 часов)
      savedImages = { originalUrl: image, generatedUrls: outputs }
      console.log('Using temporary URLs for basic plan user')
    }

    // Списываем кредиты и сохраняем генерацию в БД
    await prisma.$transaction(async (tx) => {
      // Списываем кредиты
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            decrement: totalCreditsNeeded
          }
        }
      })

      // Сохраняем генерацию с локальными URL
      await tx.generation.create({
        data: {
          userId: session.user.id,
          originalImageUrl: savedImages.originalUrl,
          generatedImages: savedImages.generatedUrls,
          style: styles.join(','),
          roomType,
          quality,
          creditsUsed: totalCreditsNeeded,
        }
      })
    })

    // Получаем обновленное количество кредитов
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    })

    return NextResponse.json({ 
      outputs: savedImages.generatedUrls,
      credits: updatedUser?.credits || 0
    })

  } catch (error) {
    console.error('API generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Вспомогательные функции для создания промптов
function getStylePrompt(styleId: string): string {
  const stylePrompts: Record<string, string> = {
    scandinavian: `Interior redesign task: Transform this {room_type} into authentic Scandinavian style interior.

STRICT PRESERVATION REQUIREMENTS:
- Keep EXACT room geometry: all wall positions, angles, and dimensions
- Maintain EXACT window locations, sizes, and shapes
- Preserve EXACT door placements and sizes
- Keep identical ceiling height and floor area
- Maintain the same camera angle, perspective, and focal length
- DO NOT change architectural structure or room layout

COMPLETE TRANSFORMATION - Scandinavian Style:

FLOORING: Light oak, birch, or ash wood flooring in natural blonde tones, matte finish

WALLS: Pure white or soft off-white painted walls, smooth clean finish, no wallpaper

FURNITURE SPECIFICATIONS:
- Minimalist wooden furniture in light wood (oak, birch, pine)
- Clean simple lines, functional Scandinavian design
- Low-profile pieces with tapered wooden legs
- Natural wood bed frame or sofa in light tones
- Simple wooden shelving units, open storage
- Avoid ornate details or heavy furniture

COLOR PALETTE: White, soft grey, beige, light wood tones, occasional muted blue or green accent

TEXTILES & SOFT FURNISHINGS:
- Natural materials: linen, cotton, wool
- Neutral bedding/upholstery in white, beige, light grey
- Textured throws in chunky knit or sheepskin
- Simple curtains in white linen or sheer fabric
- Geometric or simple patterns only

LIGHTING:
- Warm ambient lighting, 2700-3000K color temperature
- Simple pendant lights with minimal design (sphere, cone, or geometric shape)
- Natural daylight from windows emphasized
- Soft shadows, cozy atmosphere

DECOR & ACCESSORIES:
- Indoor plants: monstera, fiddle leaf fig, or snake plant in simple pots
- Minimal decoration, every item functional
- 1-2 pieces of simple wall art or prints
- Candles in simple holders
- Ceramic or wooden decorative objects
- NO clutter, clean surfaces

ATMOSPHERE: Cozy hygge feeling, bright and airy, warm and inviting, functional simplicity, connection to nature

QUALITY: Photorealistic 3D render, professional interior photography, 4K resolution, accurate Scandinavian materials, natural soft lighting, proper depth of field, clean modern aesthetic

Create a bright, minimalist, hygge-inspired Scandinavian interior that feels warm despite its simplicity.`,
    minimalism: 'minimalist, clean lines, neutral colors, uncluttered space, simple furniture, zen-like atmosphere',
    neoclassic: 'neoclassical, elegant columns, luxurious materials, symmetrical design, traditional European grandeur',
    loft: 'industrial loft, exposed brick walls, high ceilings, metal and concrete, urban warehouse style',
    classic: 'classic traditional, ornate furniture, rich fabrics, warm colors, timeless elegance, sophisticated',
    eclectic: 'eclectic mix, bohemian style, colorful patterns, vintage and modern mix, artistic and creative',
    japandi: 'Japandi style, Japanese minimalism meets Scandinavian, natural wood, clean lines, zen atmosphere',
    contemporary: 'contemporary modern, sleek furniture, bold accents, current design trends, sophisticated',
    vintage: 'vintage retro, 70s-80s style, warm colors, nostalgic furniture, cozy grandmother\'s house atmosphere',
  }
  
  return stylePrompts[styleId] || 'beautiful interior'
}

function getRoomTypePrompt(roomType: string): string {
  const roomTypePrompts: Record<string, string> = {
    living_room: 'living room',
    bedroom: 'bedroom',
    kitchen: 'kitchen',
    bathroom: 'bathroom',
    office: 'home office',
    dining_room: 'dining room',
  }
  
  return roomTypePrompts[roomType] || 'room'
}

