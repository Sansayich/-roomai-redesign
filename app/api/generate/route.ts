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
    scandinavian: `Transform this {room_type} into an authentic Scandinavian interior while keeping the exact room layout, window positions, door locations, and architectural structure unchanged.

Imagine a bright, airy Nordic space filled with natural light and hygge warmth. The floors are light oak or birch wood with a natural matte finish, and the walls are painted in pure white or soft off-white. All furniture is made from minimalist light wood - think simple oak or birch pieces with clean lines and tapered legs. The bed frame or sofa has that characteristic Scandinavian simplicity, paired with two matching wooden nightstands or side tables.

The color palette is serene and neutral: white, soft grey, beige, and natural wood tones with perhaps a muted blue or green accent. Textiles are all natural materials - linen curtains filtering soft daylight, cotton and wool throws in chunky knits, a small sheepskin rug beside the bed, bedding in white and beige with textured layers. Everything feels cozy yet uncluttered.

Lighting creates that warm hygge atmosphere with simple pendant lamps in geometric or spherical shapes hanging from the ceiling, casting soft 2700-3000K warm light. Natural daylight streams through sheer white linen curtains, creating gentle shadows and highlighting the natural wood grain.

For decoration, keep it minimal and functional: one or two indoor plants like a monstera or fiddle leaf fig in simple ceramic pots, perhaps a single piece of simple wall art, white candles in wooden holders, and a few ceramic objects. Every surface is clean and uncluttered, celebrating the beauty of empty space and natural materials.

The final image should be a photorealistic interior photograph with soft natural lighting that captures the essence of Scandinavian design - bright, warm, functional, and inviting, where every element serves a purpose and connects to nature.`,
    minimalism: `Transform this {room_type} into a pure minimalist sanctuary while preserving the exact architectural structure. Maintain all wall positions, window locations, door placements, and the original camera angle precisely.

Create an ultra-clean space with light grey polished concrete or white oak flooring and perfectly smooth white or light grey walls. Replace furniture with only the absolute essentials: a low platform bed or floating furniture pieces with geometric forms and straight lines, built-in or floating storage with handleless design, and perhaps one simple chair. Every piece should serve a clear function with no decorative elements whatsoever.

Use a strict monochromatic palette of white, light grey, and dark grey with minimal black accents. Textiles should be sparse—solid color bedding in white or grey, simple roller blinds, and maybe one smooth throw blanket. No patterns, no visual noise.

Illuminate the space with recessed ceiling lights or minimal track lighting creating bright, even illumination at 4000-5000K. The lighting should feel clean and modern without dramatic shadows. If there's a pendant light, make it a single geometric statement piece.

Leave surfaces completely empty except for perhaps one snake plant in a minimal white planter. The room should embody "less is more" philosophy with maximum negative space, creating a zen-like atmosphere that feels serene, spacious, and meditative.

Render as a photorealistic architectural photograph showcasing ultra-clean surfaces, sharp details, and that sophisticated modern aesthetic where emptiness becomes beautiful.`,
    neoclassic: `Transform this {room_type} into an elegant neoclassical interior while keeping the exact room geometry intact. Preserve all architectural boundaries, window and door positions, and maintain the same viewing angle.

Reimagine the walls in soft sophisticated neutrals—cream, taupe, or soft grey—enhanced with decorative crown molding at the ceiling, subtle wainscoting or wall panels, and a ceiling rose medallion. Install herringbone parquet flooring in warm natural wood tones that gleam with refinement.

Fill the space with classically proportioned furniture: an upholstered bed with a tall elegant headboard in velvet or linen, refined nightstands with gracefully curved cabriole legs and brass hardware, a traditional wardrobe with paneled doors, and an upholstered armchair or bench with classic silhouette. Each piece should feature subtle carved details that speak to European craftsmanship.

Layer luxurious fabrics throughout—velvet, silk, and linen in a palette of cream, champagne gold, taupe, and dusty blue or sage green. Dress windows with elegant curtains featuring swags or valances, add multiple decorative pillows with texture, and place a traditional area rug with classic patterns underfoot.

Crown the space with a crystal chandelier or elegant multi-arm fixture as the lighting centerpiece, complemented by table lamps with fabric shades. The lighting should be warm and golden at 2700K, creating soft romantic illumination. Adorn walls with a large decorative mirror in an ornate gilded frame and classic artwork in traditional frames.

Create a photorealistic interior photograph that captures timeless European elegance—sophisticated, refined, balanced symmetry, and that graceful classical beauty that never goes out of style.`,
    loft: `Transform this {room_type} into a bright industrial loft while maintaining the precise room structure. Keep all walls, windows, doors, and architectural features in their exact original positions with unchanged camera perspective.

Create an urban warehouse aesthetic that's surprisingly light and airy. Feature one wall in white-painted exposed brick or light grey concrete texture, while other walls remain white or light grey painted. Install light wood plank flooring or polished concrete in pale grey tones. Leave ceiling elements exposed—beams, pipes, or ductwork painted white or light grey to maintain brightness while celebrating raw industrial character.

Replace furniture with industrial-modern pieces: a black metal bed frame with welded details or pipe design, metal and natural wood nightstands combining black iron with light wood, open black metal shelving units for storage, and an industrial metal chair or stool. The aesthetic should feel urban and edgy but not heavy.

Frame the large window with black metal and leave it minimally dressed—perhaps simple roller blinds or nothing at all to maximize natural light. Install Edison bulb pendant lights with visible black cords and metal fixtures, creating warm ambient lighting at 2700K that softens the industrial materials.

Keep color palette crisp and modern: white, light grey, natural light wood, and black metal accents. Add minimal soft furnishings—grey or white linen bedding, maybe one textured throw. Place one or two large leafy plants in simple pots to bring life to the industrial space.

Render as a photorealistic interior photograph capturing contemporary urban living—the perfect balance of raw industrial materials and bright, livable modern comfort.`,
    classic: `Transform this {room_type} into a richly appointed traditional interior while preserving exact room dimensions and architecture. Maintain all structural elements, window and door locations, and original camera angle precisely.

Create walls in warm rich tones or elegant neutrals—perhaps burgundy, navy, forest green, or warm cream—enhanced with decorative chair rail molding, wainscoting, and crown molding. Install classic herringbone parquet in rich medium-to-dark wood tones, or lay a traditional Oriental or Persian-style area rug over hardwood.

Fill the space with substantial traditional furniture in rich dark woods like mahogany or cherry: a bed with ornate carved headboard and footboard, nightstands with cabriole legs and brass hardware, a traditional dresser or armoire with decorative carved details, and upholstered furniture featuring tufted backs or turned legs. Each piece should feel established and timeless.

Layer the room with luxurious heavy fabrics in deep jewel tones. Dress windows with elaborate curtains featuring valances, swags, or jabots over sheer underlays. Pile the bed with multiple decorative pillows trimmed with tassels and fringe, add a bedskirt and layered duvet with decorative shams. Use velvet, silk, brocade, and damask throughout.

Install a traditional crystal chandelier or ornate multi-arm fixture as the centerpiece, with table lamps featuring fabric shades and decorative bases providing ambient lighting. Keep lighting warm and golden at 2700K creating sophisticated layered illumination.

Adorn walls with oil paintings or classic art in ornate gilded frames, large decorative mirrors, decorative plates, and abundant coordinated accessories. Display crystal, porcelain, fresh flowers in ornate vases, books, and candelabras—creating that collected, layered look of traditional elegance.

Create a photorealistic interior photograph showcasing timeless sophisticated luxury—warm, rich, formal yet comfortable, with that old-world charm and established elegance.`,
    eclectic: `Transform this {room_type} into a vibrant eclectic bohemian interior while keeping exact room architecture unchanged. Preserve all walls, windows, doors, and structural boundaries with the same camera perspective.

Paint walls in warm interesting colors like greige, terracotta, mustard, or sage green, or create a dramatic gallery wall covering one section with diverse artwork, textiles, and wall hangings in various frames and styles—mixing prints, paintings, photography, and tapestries.

Mix furniture from different eras and origins with intentional creativity: pair a modern bed frame with vintage nightstands painted in unexpected colors like teal or sage, or vice versa. Include a vintage dresser or wardrobe in an interesting finish, mismatched nightstands that somehow work together, and upholstered pieces in bold fabrics. Blend Scandinavian clean lines with Moroccan patterns and vintage flea market finds.

Layer the space with fearless color combinations and patterns: jewel tones like emerald and sapphire mixed with earth tones like terracotta and mustard, all grounded by neutrals. Pile on textured throw pillows in various patterns—ikat, suzani, geometric, floral—and layer vintage or ethnic area rugs over natural wood floors. Add macrame hangings, tassels, and fringe details.

Hang a Moroccan pendant light or bohemian chandelier, mix in vintage or ethnic-inspired table lamps, and perhaps string lights for ambient sparkle. Use warm lighting at 2700K creating cozy atmosphere with mixed metal finishes—brass, copper, and black.

Fill the space with personality: multiple plants in varied decorative pots (ceramic, woven, terracotta), stacked books used as decor, global-inspired objects like lanterns and baskets, crystals, mirrors in interesting frames, and personal collections displayed proudly. The room should feel collected over time—curated chaos that tells a story.

Create a photorealistic interior photograph capturing fearless eclectic style—artistic, personal, globally inspired, with that perfect organized chaos where everything somehow works together beautifully.`,
    japandi: `Transform this {room_type} into a serene Japandi interior while maintaining exact room structure. Keep all architectural elements, walls, windows, and doors in their precise original positions with unchanged perspective.

Create a calm foundation with natural light oak, ash, or birch wood flooring in matte finish and off-white or warm beige painted walls—smooth, clean, and minimal. This aesthetic blends Japanese zen simplicity with Scandinavian warmth.

Replace furniture with low-profile pieces celebrating craftsmanship: a low platform bed close to the ground with simple clean-lined headboard in natural wood, low wooden nightstands or side tables showcasing honest joinery, a minimalist wardrobe with sliding doors or simple panels, and perhaps a low wooden chair or floor cushion for seating. Choose light oak, ash, or walnut with natural finishes that celebrate the wood grain.

Use neutral earth tones throughout: beige, sand, warm grey, natural wood, off-white, with matte black accents and maybe muted green. Dress the bed in natural linen bedding in neutral tones, add simple cotton or linen curtains, and perhaps one textured throw. Quality matters more than quantity—choose handwoven or artisan textiles with subtle textures.

Light the space with a paper pendant lamp in Japanese lantern style or bamboo fixture, creating soft diffused warm light at 2700K. Emphasize natural daylight and gentle ambient illumination—nothing harsh or dramatic.

Keep decoration minimal and intentional, embracing wabi-sabi aesthetic: one or two handcrafted ceramic pieces in organic shapes, a bonsai tree or simple greenery in a ceramic pot, maybe a simple ikebana-style flower arrangement or natural objects like stones or driftwood. Empty space is as important as filled space—every item should be deliberately placed and serve a purpose.

Create a photorealistic interior photograph capturing peaceful Japandi living—zen calm meets hygge warmth, functional beauty, sustainable simplicity, and that perfect balance where Japanese minimalism and Scandinavian coziness unite.`,
    contemporary: `Transform this {room_type} into a sophisticated contemporary interior while preserving exact architectural layout. Maintain all wall positions, windows, doors, and structural elements with the same camera angle.

Install modern wood-look flooring in medium grey-brown tones or large format tiles, creating a clean contemporary foundation. Paint walls in sophisticated neutrals like soft greige, warm grey, or taupe, possibly featuring one accent wall in a bold color like navy, emerald, charcoal, or terracotta for visual interest.

Select sleek modern furniture reflecting current design trends: an upholstered bed with fabric headboard in curved, geometric, or channel-tufted design, clean-lined nightstands with mixed materials like wood and metal or lacquer and wood, a modern wardrobe with handleless or minimal hardware, and a contemporary accent chair with interesting sculptural shape. Furniture should have legs rather than sitting heavy on the ground.

Build a color story with neutral base tones—greige, taupe, cream, white—punctuated by one bold accent color like emerald green, navy blue, terracotta, or mustard yellow. Mix textures throughout: velvet cushions, linen bedding, leather details, and metal accents in brass, gold, black, or chrome. Add contemporary patterns—geometric or abstract—on pillows or an area rug.

Install a statement modern lighting fixture as focal point—perhaps a geometric pendant, sculptural chandelier, or artistic fixture in brass, gold, or black metal. Add modern table lamps with interesting bases in ceramic, brass, or marble. Create layered lighting that's both warm and bright.

Style with contemporary accessories: a large modern mirror in round, geometric, or organic shape, contemporary abstract artwork or photography, large leafy plants like fiddle leaf fig or monstera in modern planters, decorative objects with sculptural quality, and coffee table books. Keep it curated, not cluttered.

Create a photorealistic interior photograph showcasing sophisticated modern living—current and stylish, comfortable yet refined, with that designer look that feels both on-trend and timeless.`,
    vintage: `Transform this {room_type} into an extreme authentic Soviet babushka apartment from the 1970s-1980s while keeping exact room structure. Preserve all walls, windows, doors, and architectural elements with the same camera perspective—only the interior design will change dramatically.

This is critical: create a maximalist nostalgic USSR aesthetic with visible age and wear. Cover walls with faded floral wallpaper in dated patterns—large roses or geometric designs from the Soviet era—or paint them in typical USSR colors like olive green, pale blue, or cream. Show some age with slight peeling at corners. Install worn dark parquet flooring with visible scratches and gaps, or old linoleum with faded geometric or floral patterns.

The defining element—absolutely mandatory—hang a large Oriental or Persian-style decorative carpet on the wall in burgundy, red, or rust tones with traditional patterns. This carpet wall hanging should be prominently displayed above the bed or sofa as the main wall decoration. This is THE signature element of Soviet grandmother interiors.

Fill the space with dark wood Soviet furniture from the 1960s-80s: a "stenka" wall unit or old wardrobe showing age, metal bed frame with brass knobs and decorative details, mismatched old wooden nightstands, and a worn sofa with handmade floral cover. Everything should look lived-in for decades.

Cover every single surface with lace doilies—on tables, nightstands, under the TV, under vases, everywhere. Dress windows with heavy multi-layered curtains: sheer net curtains (tulle) underneath with heavy drapes and decorative valances on top. Use dated floral patterns throughout bedding and upholstery.

Install a crystal chandelier from the Soviet era or old USSR ceiling lamp with fabric shade. Add table lamps with fringe-trimmed fabric shades. Keep lighting warm and yellow from old bulbs at 2700K.

Now the most important part—maximum clutter everywhere: cover every surface with porcelain figurines (ballet dancers, animals, children), Soviet crystal vases and bowls, decorative plates hanging on walls, many family photos in old frames scattered across surfaces and walls, an old Soviet TV set like Березка or Электрон, excessive houseplants in mismatched pots (geraniums, violets, aloe), souvenirs from Soviet sanatoriums, decorative boxes, amber or wooden jewelry boxes, Soviet-era books on shelves, china tea sets displayed in glass cabinets, decorative towels never actually used, and either religious Orthodox icons or Soviet memorabilia. Nothing should ever look like it was thrown away—everything is kept forever.

The atmosphere must feel sentimental, cramped, warm but dated, kitschy, and authentically lived-in for decades. Every corner should have something displayed, every surface should be covered with memories and treasures. This is grandmother's apartment where nothing changes and everything has a story.

Create a photorealistic interior photograph with authentic aged vintage textures, warm nostalgic lighting, incredibly detailed clutter, and that unmistakable USSR-era aesthetic that immediately says "babushka's apartment" with both humor and affection.`,
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

