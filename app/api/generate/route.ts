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
             scandinavian: `Transform this {room_type} into a bright Scandinavian interior while maintaining the exact room layout and architecture. Keep all walls, windows, doors, and structural elements in their original positions with the same camera perspective.

Reimagine the space with light oak or birch wood flooring in natural blonde tones and pure white painted walls. Replace all furniture and furnishings with minimalist Scandinavian pieces appropriate for a {room_type}: choose light wood furniture with clean lines, tapered legs, and simple functional forms. Everything should embody Nordic simplicity with no ornate details—just honest materials and purposeful design.

Use natural textiles throughout in neutral tones: white, beige, and soft grey in linen, cotton, and wool. Add texture with chunky knits, sheepskin accents, or natural fiber rugs where appropriate. Dress windows with sheer white linen curtains that filter beautiful natural daylight. Include thriving green plants like monstera or fiddle leaf fig in simple ceramic pots to bring nature indoors.

Light the space with warm ambient illumination at 2700K, featuring simple pendant lights or lamps with geometric or spherical shapes. The atmosphere should feel cozy and inviting with that signature hygge warmth—bright, airy, yet incredibly comfortable. Keep surfaces clean with minimal decoration: perhaps one or two simple art prints, candles in understated holders, and a few carefully chosen functional objects.

Create a photorealistic interior photograph that captures the essence of Scandinavian living—functional simplicity, natural materials, and that perfect balance of minimalism and warmth. Optimize the image for print and digital viewing (300 dpi).`,
    minimalism: `Transform this {room_type} into a pure minimalist sanctuary while preserving the exact architectural structure. Maintain all wall positions, window locations, door placements, and the original camera angle precisely.

Create an ultra-clean space with light grey polished concrete or white oak flooring and perfectly smooth white or light grey walls. Replace all furniture and furnishings with only the absolute essential pieces for a {room_type}: select low-profile or floating furniture with geometric forms, straight lines, and handleless design. Every piece should serve a clear function with zero decorative elements—pure form following function.

Use a strict monochromatic palette of white, light grey, and dark grey with minimal black accents. Keep textiles extremely sparse: solid colors only in white or grey, smooth materials, simple window treatments like roller blinds. Absolutely no patterns or visual complexity.

Illuminate the space with recessed ceiling lights or minimal track lighting creating bright, even illumination at 4000-5000K. The lighting should feel clean and modern without dramatic shadows. If needed, include one geometric pendant light as a statement piece—nothing more.

Leave surfaces completely empty except for perhaps one carefully chosen plant in a minimal white planter. The space should embody "less is more" philosophy with maximum negative space, creating a zen-like atmosphere that feels serene, spacious, and meditative. Empty space is the design.

Render as a photorealistic architectural photograph showcasing ultra-clean surfaces, sharp details, and that sophisticated modern aesthetic where emptiness becomes beautiful. Optimize the image for print and digital viewing (300 dpi).`,
    neoclassic: `Transform this {room_type} into an elegant neoclassical interior while keeping the exact room geometry intact. Preserve all architectural boundaries, window and door positions, and maintain the same viewing angle.

Reimagine the walls in soft sophisticated neutrals—cream, taupe, or soft grey—enhanced with decorative crown molding at the ceiling, subtle wainscoting or wall panels, and elegant architectural details. Install herringbone parquet flooring in warm natural wood tones that gleam with refinement. Add a decorative ceiling rose medallion at the center.

Fill the space with classically proportioned furniture appropriate for a {room_type}: select pieces with gracefully curved legs, refined silhouettes, and elegant upholstery. Choose furniture featuring subtle carved details, brass or gold hardware, and traditional proportions that speak to European craftsmanship. Everything should feel sophisticated and timeless.

Layer luxurious fabrics throughout in a palette of cream, champagne gold, taupe, soft grey, with touches of dusty blue or sage green. Use velvet, silk, and linen generously. Dress windows with elegant curtains featuring swags or valances. Add decorative pillows with texture and traditional area rugs with classic patterns where appropriate.

Crown the space with a crystal chandelier or elegant multi-arm fixture as the lighting centerpiece, complemented by table lamps with fabric shades. The lighting should be warm and golden at 2700K, creating soft romantic illumination. Adorn walls with a large decorative mirror in an ornate gilded frame and classic artwork in traditional frames.

Create a photorealistic interior photograph that captures timeless European elegance—sophisticated, refined, with balanced symmetry and that graceful classical beauty that never goes out of style. Optimize the image for print and digital viewing (300 dpi).`,
    loft: `Transform this {room_type} into a bright industrial loft while maintaining the precise room structure. Keep all walls, windows, doors, and architectural features in their exact original positions with unchanged camera perspective.

Create an urban warehouse aesthetic that's surprisingly light and airy. Feature one wall in white-painted exposed brick or light grey concrete texture, while other walls remain white or light grey painted. Install light wood plank flooring or polished concrete in pale grey tones. Leave ceiling elements exposed—beams, pipes, or ductwork painted white or light grey to maintain brightness while celebrating raw industrial character.

Replace all furniture and furnishings with industrial-modern pieces suitable for a {room_type}: select items combining black metal frames with natural wood elements, open metal shelving, and furniture with visible welded details, bolts, or pipe construction. The aesthetic should feel urban and edgy but not heavy—modern warehouse style with clean lines.

Keep the color palette crisp: white, light grey, natural light wood, and black metal accents. Use minimal textiles in grey, white, or natural linen—simple and unpretentious. Frame windows with black metal and leave minimally dressed—simple roller blinds or nothing at all to maximize natural light.

Install Edison bulb pendant lights with visible black cords and metal fixtures, creating warm ambient lighting at 2700K that softens the industrial materials. Add one or two large leafy plants in simple concrete or metal pots to bring life to the industrial space.

Render as a photorealistic interior photograph capturing contemporary urban living—the perfect balance of raw industrial materials and bright, livable modern comfort with an airy spacious feel. Optimize the image for print and digital viewing (300 dpi).`,
    classic: `Transform this {room_type} into a richly appointed traditional interior while preserving exact room dimensions and architecture. Maintain all structural elements, window and door locations, and original camera angle precisely.

Create walls in warm rich tones or elegant neutrals—burgundy, navy, forest green, or warm cream—enhanced with decorative chair rail molding, wainscoting, and substantial crown molding. Install classic herringbone parquet in rich medium-to-dark wood tones, or lay a traditional Oriental or Persian-style area rug with intricate patterns.

Fill the space with substantial traditional furniture appropriate for a {room_type} in rich dark woods like mahogany or cherry: select pieces with ornate carved details, cabriole legs, brass hardware, and traditional proportions. Include upholstered furniture featuring tufted details or turned legs. Each piece should feel established, timeless, and speak to old-world craftsmanship.

Layer the space with luxurious heavy fabrics in deep jewel tones and classic patterns. Use velvet, silk, brocade, and damask generously. Dress windows with elaborate curtains featuring valances, swags, or jabots over sheer underlays. Add multiple decorative pillows trimmed with tassels and fringe, and use rich textiles appropriate for the room type.

Install a traditional crystal chandelier or ornate multi-arm fixture as the centerpiece, with table lamps featuring fabric shades and decorative bases providing ambient lighting. Keep lighting warm and golden at 2700K creating sophisticated layered illumination.

Adorn walls with oil paintings or classic art in ornate gilded frames, large decorative mirrors, and abundant coordinated accessories. Display crystal, porcelain, fresh flowers in ornate vases, books, and decorative objects—creating that collected, layered look of traditional elegance.

Create a photorealistic interior photograph showcasing timeless sophisticated luxury—warm, rich, formal yet comfortable, with that old-world charm and established elegance. Optimize the image for print and digital viewing (300 dpi).`,
    eclectic: `Transform this {room_type} into a vibrant eclectic bohemian interior while keeping exact room architecture unchanged. Preserve all walls, windows, doors, and structural boundaries with the same camera perspective.

Paint walls in warm interesting colors like greige, terracotta, mustard, or sage green, or create a dramatic gallery wall covering one section with diverse artwork, textiles, and wall hangings in various frames and styles—mixing prints, paintings, photography, and tapestries in a curated chaos.

Mix furniture from different eras and origins appropriate for a {room_type} with intentional creativity: blend vintage pieces with modern designs, combine different wood finishes and painted furniture in unexpected colors like teal, sage, or mustard. Include mismatched pieces that somehow work together—vintage finds paired with contemporary items. Blend Scandinavian clean lines with Moroccan patterns, mid-century pieces with boho textiles, creating a collected-over-time aesthetic.

Layer the space fearlessly with bold color combinations: jewel tones like emerald and sapphire mixed with earth tones like terracotta and rust, all grounded by neutrals. Use abundant patterned textiles—ikat, suzani, geometric, floral—in throws, pillows, and upholstery. Layer vintage or ethnic area rugs. Add macrame hangings, tassels, fringe details, and texture everywhere.

Hang a Moroccan pendant light, bohemian chandelier, or mix of vintage lamps with ethnic-inspired designs. Use warm lighting at 2700K creating cozy atmosphere with mixed metal finishes—brass, copper, and black iron together.

Fill every surface with personality: multiple plants in varied decorative pots (ceramic, woven, terracotta), stacked books used as decor, global-inspired objects like lanterns and baskets, crystals, mirrors in interesting frames, and personal collections displayed proudly. The space should feel artistic, traveled, and full of stories.

Create a photorealistic interior photograph capturing fearless eclectic style—personal, globally inspired, with that perfect organized chaos where diverse elements create unexpected harmony. Optimize the image for print and digital viewing (300 dpi).`,
    japandi: `Transform this {room_type} into a serene Japandi interior while maintaining exact room structure. Keep all architectural elements, walls, windows, and doors in their precise original positions with unchanged perspective.

Create a calm foundation with natural light oak, ash, or birch wood flooring in matte finish and off-white or warm beige painted walls—smooth, clean, and minimal. This aesthetic blends Japanese zen simplicity with Scandinavian warmth.

Replace all furniture and furnishings with low-profile pieces appropriate for a {room_type} that celebrate craftsmanship: select items in natural wood with clean lines and honest joinery visible, featuring Japanese-influenced low forms combined with Scandinavian functionality. Choose light oak, ash, or walnut with natural finishes that celebrate the wood grain and handcrafted quality.

Use neutral earth tones throughout: beige, sand, warm grey, natural wood, off-white, with matte black accents and subtle muted green. Employ natural textiles in linen and cotton with subtle textures—quality over quantity. Choose handwoven or artisan pieces that show the maker's hand.

Light the space with paper pendant lamps in Japanese lantern style or bamboo fixtures, creating soft diffused warm light at 2700K. Emphasize natural daylight and gentle ambient illumination—nothing harsh or dramatic. Simple linen curtains filter light beautifully.

Keep decoration minimal and intentional, embracing wabi-sabi aesthetic: one or two handcrafted ceramic pieces in organic shapes, a bonsai tree or simple greenery in a ceramic pot, maybe natural objects like stones or driftwood. Empty space is as important as filled space—every item deliberately placed with purpose.

Create a photorealistic interior photograph capturing peaceful Japandi living—zen calm meets hygge warmth, functional beauty, sustainable simplicity, where Japanese minimalism and Scandinavian coziness unite perfectly. Optimize the image for print and digital viewing (300 dpi).`,
    contemporary: `Transform this {room_type} into a sophisticated contemporary interior while preserving exact architectural layout. Maintain all wall positions, windows, doors, and structural elements with the same camera angle.

Install modern wood-look flooring in medium grey-brown tones or large format tiles, creating a clean contemporary foundation. Paint walls in sophisticated neutrals like soft greige, warm grey, or taupe, possibly featuring one accent wall in a bold color like navy, emerald, charcoal, or terracotta for visual drama.

Select sleek modern furniture appropriate for a {room_type} that reflects current design trends: choose pieces with curved or geometric lines, upholstered in quality fabrics, featuring mixed materials like wood and metal or lacquer and wood. Select furniture with visible legs rather than heavy grounded pieces, and opt for handleless or minimal hardware. Everything should feel current, comfortable, and sophisticated.

Build a color story with neutral base tones—greige, taupe, cream, white—punctuated by one bold accent color like emerald green, navy blue, terracotta, or mustard yellow. Mix textures throughout: velvet, linen, leather, and metal. Use contemporary patterns—geometric or abstract—on textiles and accessories where appropriate.

Install a statement modern lighting fixture as focal point—perhaps a geometric pendant, sculptural chandelier, or artistic fixture in brass, gold, or black metal. Include modern lamps with interesting bases in ceramic, brass, or marble. Create layered lighting that balances warmth and brightness.

Style with contemporary accessories: a large modern mirror in round, geometric, or organic shape, contemporary abstract artwork or photography, large leafy plants in modern planters, and decorative objects with sculptural quality. Keep it curated and intentional, not cluttered.

Create a photorealistic interior photograph showcasing sophisticated modern living—current and stylish, comfortable yet refined, with that designer look that feels both on-trend and timeless. Optimize the image for print and digital viewing (300 dpi).`,
    vintage: `Transform this {room_type} into an extreme authentic Soviet babushka apartment from the 1970s-1980s while keeping exact room structure. Preserve all walls, windows, doors, and architectural elements with the same camera perspective—only the interior design will change dramatically into nostalgic USSR maximalism.

Cover walls with faded floral wallpaper in dated patterns—large roses or geometric designs from the Soviet era—or paint them in typical USSR colors like olive green, pale blue, or cream, showing age with slight peeling at corners. Install worn dark parquet flooring with visible scratches and gaps, or old linolinum with faded patterns showing decades of use.

This is absolutely mandatory and the defining element: hang a large Oriental or Persian-style decorative carpet on the wall in burgundy, red, or rust tones with traditional ornate patterns. Position this carpet wall hanging prominently as the main wall decoration—this is THE signature must-have element of Soviet grandmother interiors that cannot be omitted.

Fill the space with dark wood Soviet furniture from the 1960s-80s appropriate for a {room_type}: include pieces like "stenka" wall units, old wardrobes, worn upholstered furniture with handmade floral covers, metal-framed pieces with brass details, and mismatched old wooden furniture. Everything should look authentically aged and lived-in for decades with visible wear.

Cover absolutely every surface with lace doilies—on tables, shelves, under objects, everywhere. Dress windows with heavy multi-layered curtains: sheer net curtains (tulle) underneath with heavy drapes and elaborate decorative valances on top. Use dated floral patterns throughout textiles and upholstery in typical Soviet color combinations.

Install a crystal chandelier from the Soviet era or old USSR ceiling lamp with fabric shade and fringe trim. Add table lamps with fringe-trimmed fabric shades. Keep lighting warm and yellow from old bulbs at 2700K creating that nostalgic glow.

Now the critical part—absolute maximum clutter on every surface: porcelain figurines (ballet dancers, animals, children), Soviet crystal vases and decorative bowls, decorative plates hanging on walls, dozens of family photos in old mismatched frames covering surfaces and walls, an old Soviet TV set, excessive houseplants in mismatched pots (geraniums, African violets, aloe), souvenirs from Soviet sanatoriums and travels, decorative boxes, wooden or amber jewelry boxes, Soviet-era books stacked on shelves, china tea sets displayed in glass cabinets, decorative embroidered towels never used, and either Orthodox religious icons or Soviet memorabilia. Nothing is ever thrown away—every object kept forever with sentimental attachment.

The atmosphere must scream sentimental cramped maximalism—warm but dated, kitschy, authentically lived-in for decades with every corner displaying something, every surface covered with memories and treasures accumulated over a lifetime. This is babushka's domain where time stopped in the 1980s and nothing ever changes.

Create a photorealistic interior photograph with authentic aged vintage textures showing wear and patina, warm nostalgic yellow-toned lighting, incredibly detailed clutter filling every space, and that unmistakable USSR-era aesthetic that immediately evokes "Soviet grandmother's apartment" with equal parts humor, nostalgia, and affection. Optimize the image for print and digital viewing (300 dpi).`,
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

