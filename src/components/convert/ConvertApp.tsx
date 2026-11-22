'use client'

// Vortex Convert - Convertidor de imagenes 100% local.
// PNG <-> JPG <-> WebP por lote, con calidad, redimensionado y peso
// antes/desde. Canvas toBlob: ningun archivo sale del navegador.

import { useCallback, useRef, useState } from 'react'
import {
  ArrowLeftRight,
  Upload,
  Download,
  Trash2,
  X,
  Loader2,
  Images,
  Check,
} from 'lucide-react'
import {
  convertImage,
  downloadBlob,
  formatBytes,
  loadImageFile,
  outputName,
  type LoadedImage,
  type TargetFormat,
} from '@/lib/convert'

const SUPPORT_EMAIL = 'vortexmusic.soporte.app@gmail.com'

function VortexLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="10" fill="#161616" />
      <path d="M12 18h16l-4-5" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 30H20l4 5" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Footer() {
  return (
    <footer className="w-full border-t border-[#2b2b31] bg-[#17171a] px-4 py-3 mt-auto">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-2">
          <VortexLogo className="w-5 h-5" />
          <span className="text-xs text-[#9b9ba4]">Vortex Company · Suite Vórtex · Gratis, sin anuncios, 100% local</span>
        </div>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[11px] text-[#fbbf24] hover:underline">
          Soporte: {SUPPORT_EMAIL}
        </a>
        <span className="text-[10px] text-[#6b6b74]">© 2026 Vortex Company</span>
      </div>
    </footer>
  )
}

const btn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#2b2b31] bg-[#1e1e22] px-3 py-1.5 text-xs font-medium text-[#ececf1] hover:border-[#f59e0b]/60 hover:bg-[#2b2b31] transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
const primary =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#f59e0b] px-3.5 py-2 text-xs font-semibold text-[#27190a] hover:bg-[#fbbf24] transition-colors disabled:opacity-40 disabled:cursor-not-allowed'

interface RowResult {
  bytes: number
  url: string
  width: number
  height: number
  done: boolean
}

export default function ConvertApp() {
  const [items, setItems] = useState<LoadedImage[]>([])
  const [results, setResults] = useState<Record<string, RowResult>>({})
  const [format, setFormat] = useState<TargetFormat>('webp')
  const [quality, setQuality] = useState(85)
  const [maxDim, setMaxDim] = useState(0)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      setError('')
      const added: LoadedImage[] = []
      for (const f of Array.from(files)) {
        if (!f.type.startsWith('image/')) continue
        try {
          added.push(await loadImageFile(f))
        } catch {
          setError(`No se pudo cargar: ${f.name}`)
        }
      }
      if (added.length) setItems((prev) => [...prev, ...added])
    },
    []
  )

  const convertOne = useCallback(
    async (item: LoadedImage) => {
      const r = await convertImage(item, format, quality / 100, maxDim, bgColor)
      setResults((prev) => ({
        ...prev,
        [item.id]: { bytes: r.bytes, url: r.dataUrl, width: r.width, height: r.height, done: true },
      }))
    },
    [format, quality, maxDim, bgColor]
  )

  const convertAll = useCallback(async () => {
    setBusy(true)
    setError('')
    for (const item of items) {
      try {
        await convertOne(item)
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
        break
      }
    }
    setBusy(false)
  }, [items, convertOne])

  const downloadOne = useCallback(
    (item: LoadedImage) => {
      const r = results[item.id]
      if (!r?.done) return
      fetch(r.url)
        .then((res) => res.blob())
        .then((blob) => downloadBlob(blob, outputName(item, format)))
    },
    [results, format]
  )

  const downloadAll = useCallback(() => {
    // descarga secuencial: los navegadores bloquean multiples descargas instantaneas
    const pending = items.filter((i) => results[i.id]?.done)
    pending.forEach((item, i) => setTimeout(() => downloadOne(item), i * 350))
  }, [items, results, downloadOne])

  const doneCount = items.filter((i) => results[i.id]?.done).length
  const savedBytes = items.reduce((acc, i) => {
    const r = results[i.id]
    return r?.done ? acc + (i.bytes - r.bytes) : acc
  }, 0)

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0f0f10] text-[#ececf1]">
      <header className="border-b border-[#2b2b31] bg-[#17171a]">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <VortexLogo className="w-8 h-8" />
          <div className="flex-1">
            <h1 className="text-base font-bold tracking-tight">Vórtex Convert</h1>
            <p className="text-[11px] text-[#9b9ba4]">Convierte tus imágenes, sin límites</p>
          </div>
          <span className="rounded-full border border-[#2b2b31] bg-[#1e1e22] px-2.5 py-1 text-[10px] text-[#9b9ba4]">
            100% local
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 space-y-5">
        {/* carga */}
        <section
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#2b2b31] bg-[#17171a] px-4 py-10 text-center cursor-pointer hover:border-[#f59e0b]/50 transition-colors"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            if (e.dataTransfer.files?.length) void addFiles(e.dataTransfer.files)
          }}
        >
          <Upload className="w-9 h-9 text-[#6b6b74]" aria-hidden />
          <p className="text-xs text-[#9b9ba4]">Sube o arrastra tus imagenes (PNG, JPG, WebP...)</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </section>

        {error && <p className="text-[11px] text-red-400">{error}</p>}

        {/* opciones */}
        {items.length > 0 && (
          <section className="rounded-xl border border-[#2b2b31] bg-[#17171a] p-4 space-y-3">
            <h2 className="text-xs font-semibold text-[#9b9ba4] uppercase tracking-wider">Salida</h2>
            <div className="flex flex-wrap gap-1.5">
              {(['png', 'jpeg', 'webp'] as TargetFormat[]).map((f) => (
                <button
                  key={f}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    format === f
                      ? 'border-[#f59e0b] bg-[#f59e0b]/15 text-[#fbbf24]'
                      : 'border-[#2b2b31] bg-[#1e1e22] text-[#9b9ba4] hover:border-[#f59e0b]/50'
                  }`}
                  onClick={() => setFormat(f)}
                >
                  {f === 'jpeg' ? 'JPG' : f.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {format !== 'png' && (
                <label className="flex items-center justify-between rounded-lg border border-[#2b2b31] bg-[#1e1e22] px-3 py-2 text-xs text-[#9b9ba4]">
                  Calidad
                  <span className="flex items-center gap-2">
                    <input type="range" min={30} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="accent-[#f59e0b] w-24" />
                    <span className="tabular-nums w-9 text-right text-[#ececf1]">{quality}%</span>
                  </span>
                </label>
              )}
              <label className="flex items-center justify-between rounded-lg border border-[#2b2b31] bg-[#1e1e22] px-3 py-2 text-xs text-[#9b9ba4]">
                Max. lado
                <span className="flex items-center gap-2">
                  <input type="range" min={0} max={4096} step={128} value={maxDim} onChange={(e) => setMaxDim(Number(e.target.value))} className="accent-[#f59e0b] w-24" />
                  <span className="tabular-nums w-16 text-right text-[#ececf1]">{maxDim === 0 ? 'original' : maxDim + 'px'}</span>
                </span>
              </label>
              {format === 'jpeg' && (
                <div className="flex items-center justify-between rounded-lg border border-[#2b2b31] bg-[#1e1e22] px-3 py-2">
                  <label htmlFor="cv-bg" className="text-xs text-[#9b9ba4]">Fondo (transp.)</label>
                  <input id="cv-bg" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-7 w-10 cursor-pointer rounded border border-[#2b2b31] bg-transparent" />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button className={primary} onClick={convertAll} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <ArrowLeftRight className="w-4 h-4" aria-hidden />}
                {busy ? 'Convirtiendo...' : `Convertir ${items.length > 1 ? items.length + ' imagenes' : 'imagen'} a ${format === 'jpeg' ? 'JPG' : format.toUpperCase()}`}
              </button>
              {doneCount > 0 && (
                <button className={primary} onClick={downloadAll}>
                  <Download className="w-4 h-4" aria-hidden /> Descargar {doneCount > 1 ? `todas (${doneCount})` : 'resultado'}
                </button>
              )}
            </div>
            {doneCount > 0 && (
              <p className="text-[11px] text-[#9b9ba4]">
                {savedBytes >= 0 ? `Ahorro total: ${formatBytes(savedBytes)}` : `Peso añadido: ${formatBytes(-savedBytes)}`}
              </p>
            )}
          </section>
        )}

        {/* lista */}
        {items.length > 0 && (
          <section className="rounded-xl border border-[#2b2b31] bg-[#17171a] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-[#9b9ba4] uppercase tracking-wider flex items-center gap-1.5">
                <Images className="w-3.5 h-3.5" aria-hidden /> Imagenes ({items.length})
              </h2>
              <button className={btn} onClick={() => { setItems([]); setResults({}) }}>
                <X className="w-3.5 h-3.5" aria-hidden /> Vaciar lista
              </button>
            </div>
            <ul className="space-y-2">
              {items.map((item) => {
                const r = results[item.id]
                return (
                  <li key={item.id} className="flex items-center gap-3 rounded-lg border border-[#2b2b31] bg-[#1e1e22] px-3 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r?.done ? r.url : item.url} alt={item.name} className="h-10 w-10 rounded object-cover border border-[#2b2b31]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{item.name}</p>
                      <p className="text-[10px] text-[#9b9ba4] tabular-nums">
                        {item.width}×{item.height}px · {formatBytes(item.bytes)}
                        {r?.done && (
                          <>
                            {' → '}
                            <span className="text-[#fbbf24]">{formatBytes(r.bytes)}</span>
                            {' · '}
                            {r.width}×{r.height}px
                            {r.bytes !== item.bytes && (
                              <span className={r.bytes < item.bytes ? ' text-emerald-400' : ' text-amber-400'}>
                                {' '}({r.bytes < item.bytes ? '-' : '+'}
                                {Math.abs(Math.round(((r.bytes - item.bytes) / item.bytes) * 100))}%)
                              </span>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {r?.done ? (
                        <button className={btn} onClick={() => downloadOne(item)} title="Descargar">
                          <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden /> <Download className="w-3.5 h-3.5" aria-hidden />
                        </button>
                      ) : (
                        <button className={btn} onClick={() => void convertOne(item)} disabled={busy} title="Convertir">
                          <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden />
                        </button>
                      )}
                      <button
                        className={btn}
                        onClick={() => {
                          URL.revokeObjectURL(item.url)
                          setItems((prev) => prev.filter((x) => x.id !== item.id))
                          setResults((prev) => {
                            const { [item.id]: _gone, ...rest } = prev
                            return rest
                          })
                        }}
                        title="Quitar"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
