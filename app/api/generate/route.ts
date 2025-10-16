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
        
        if (quality === 'best') {
          // Лучшее качество - Nano banana (сохраняет геометрию комнаты)
          const model = 'google/nano-banana'
          
          output = await replicate.run(
            model as any,
            {
              input: {
                prompt: `Transform this ${getRoomTypePrompt(roomType)} into a ${getStylePrompt(styleId)} style. Preserve the exact room geometry, window positions, door locations, ceiling height, and architectural structure. Only change the interior design elements: furniture, colors, textures, lighting, and decorative items to match the ${styleId} aesthetic. Keep the same camera angle and room proportions.`,
                image_input: [image],
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
        } else {
          // Хорошее качество - ControlNet
          const model = 'jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b'
          
          output = await replicate.run(
            model as any,
            {
              input: {
                image: image,
                prompt: `A ${getStylePrompt(styleId)} ${getRoomTypePrompt(roomType)}, professional interior design, high quality, detailed, well-lit, modern photography`,
                num_outputs: 1,
                num_inference_steps: 50,
                guidance_scale: 7.5,
                negative_prompt: 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry',
              },
            }
          )
          
          // ControlNet возвращает массив из 2 изображений - берем ВТОРОЕ!
          if (Array.isArray(output) && output.length >= 2) {
            outputs.push(output[1] as string) // Второе изображение - финальный результат
          } else if (Array.isArray(output) && output.length > 0) {
            outputs.push(output[0] as string)
          }
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
    scandinavian: 'Scandinavian, light wood, white walls, cozy hygge atmosphere, natural materials, minimalist furniture',
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

