// Conversion de formatos de imagen 100% local: PNG <-> JPG <-> WebP con
// calidad configurable, redimensionado opcional y fondo para la transparencia.
// Usa canvas.toBlob: ningun archivo sale del navegador.

export type TargetFormat = 'png' | 'jpeg' | 'webp'

export interface LoadedImage {
  id: string
  name: string
  /** nombre sin extension, para el archivo de salida */
  base: string
  url: string
  width: number
  height: number
  bytes: number
}

export interface ConvertedResult {
  blob: Blob
  bytes: number
  dataUrl: string
  width: number
  height: number
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

function readImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo leer la imagen'))
    img.src = url
  })
}

export async function loadImageFile(file: File): Promise<LoadedImage> {
  const url = URL.createObjectURL(file)
  const img = await readImage(url)
  const dot = file.name.lastIndexOf('.')
  const base = dot > 0 ? file.name.slice(0, dot) : file.name
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    base,
    url,
    width: img.naturalWidth,
    height: img.naturalHeight,
    bytes: file.size,
  }
}

/**
 * Convierte una imagen cargada al formato destino. Si maxDim > 0 y la imagen
 * lo excede, se reduce proporcionalmente. Para JPG el fondo transparente se
 * rellena con bgColor (por defecto blanco).
 */
export async function convertImage(
  item: LoadedImage,
  format: TargetFormat,
  quality: number,
  maxDim: number,
  bgColor: string
): Promise<ConvertedResult> {
  const img = await readImage(item.url)
  const scale = maxDim > 0 ? Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight)) : 1
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  if (format === 'jpeg') {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, w, h)
  }
  ctx.drawImage(img, 0, 0, w, h)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, `image/${format}`, format === 'png' ? undefined : quality)
  )
  if (!blob) throw new Error('Tu navegador no soporta este formato de salida')
  const dataUrl = canvas.toDataURL(`image/${format}`)
  return { blob, bytes: blob.size, dataUrl, width: w, height: h }
}

export function outputName(item: LoadedImage, format: TargetFormat): string {
  const ext = format === 'jpeg' ? 'jpg' : format
  return `${item.base || 'imagen'}.${ext}`
}

export function downloadBlob(blob: Blob, name: string): void {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

export function mimeOf(format: TargetFormat): string {
  return `image/${format}`
}
