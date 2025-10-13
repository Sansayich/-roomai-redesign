import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

// Инициализация Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
})

export async function POST(request: NextRequest) {
  try {
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
        // Можно использовать разные модели в зависимости от качества
        const model = 'timbrooks/instruct-pix2pix:30c1d0b916a6f1e75d640987b3e1c7f0c3f8b6e5e0a2e7b6f2b5e5c4d3a2b1c0'

        const output = await replicate.run(
          model as any,
          {
            input: {
              image: image,
              prompt: `Transform this room into a ${getStylePrompt(styleId)} ${getRoomTypePrompt(roomType)}, professional interior design, high quality, detailed, well-lit, modern photography`,
              num_inference_steps: quality === 'best' ? 50 : 30,
              image_guidance_scale: 1.5,
              guidance_scale: 7.5,
            },
          }
        )

        if (Array.isArray(output) && output.length > 0) {
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

    return NextResponse.json({ outputs })

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
    modern: 'modern, contemporary, sleek, minimalist design',
    summer: 'bright, airy, light summer colors, coastal vibes',
    professional: 'professional office, corporate, clean and organized',
    tropical: 'tropical paradise, lush plants, natural materials, exotic',
    coastal: 'coastal, beach house, nautical, light and breezy',
    vintage: 'vintage, retro, antique furniture, classic design',
    industrial: 'industrial loft, exposed brick, metal and wood, urban',
    neoclassic: 'neoclassical, elegant, luxurious, traditional European',
    tribal: 'tribal, ethnic patterns, natural materials, earthy tones',
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

