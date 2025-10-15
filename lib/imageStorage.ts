import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

const GENERATIONS_DIR = path.join(process.cwd(), 'public', 'generations')

// Создать директорию, если не существует
export async function ensureGenerationsDir() {
  try {
    await mkdir(GENERATIONS_DIR, { recursive: true })
  } catch (error) {
    // Директория уже существует
  }
}

// Скачать изображение по URL и сохранить локально
export async function downloadAndSaveImage(imageUrl: string, fileName: string): Promise<string> {
  try {
    await ensureGenerationsDir()

    // Скачать изображение
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Сохранить файл
    const filePath = path.join(GENERATIONS_DIR, fileName)
    await writeFile(filePath, buffer)

    // Вернуть публичный URL
    return `/generations/${fileName}`
  } catch (error) {
    console.error('Error downloading and saving image:', error)
    throw error
  }
}

// Сохранить несколько изображений
export async function saveGeneratedImages(
  originalImageUrl: string,
  generatedImageUrls: string[],
  generationId: string
): Promise<{ originalUrl: string; generatedUrls: string[] }> {
  try {
    const timestamp = Date.now()

    // Сохранить оригинал
    const originalFileName = `${generationId}-original-${timestamp}.png`
    const savedOriginalUrl = await downloadAndSaveImage(originalImageUrl, originalFileName)

    // Сохранить сгенерированные изображения
    const savedGeneratedUrls: string[] = []
    for (let i = 0; i < generatedImageUrls.length; i++) {
      const fileName = `${generationId}-generated-${i}-${timestamp}.png`
      const savedUrl = await downloadAndSaveImage(generatedImageUrls[i], fileName)
      savedGeneratedUrls.push(savedUrl)
    }

    return {
      originalUrl: savedOriginalUrl,
      generatedUrls: savedGeneratedUrls
    }
  } catch (error) {
    console.error('Error saving generated images:', error)
    throw error
  }
}

