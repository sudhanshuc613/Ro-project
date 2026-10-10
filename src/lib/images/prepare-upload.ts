/**
 * UPLOAD SE PEHLE BROWSER ME HI IMAGE TAIYAAR KARNA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 YE FILE EK ASLI BUG KI WAJAH SE BANI (11 Oct 2026)
 * ─────────────────────────────────────────────────────
 * Owner ne 6.6 MB ka banner (2752×1536 PNG) upload kiya aur laal error aaya:
 *
 *     "Server sent an unreadable response."
 *
 * Wajah: **Vercel ke serverless function ka request body limit 4.5 MB hai.**
 * 6.6 MB ki request hamare code tak pahunchti hi nahi — Vercel ka edge use
 * pehle hi rok deta hai aur ek HTML error page wapas bhejta hai. Browser ne
 * us HTML ko JSON samajh ke parse karne ki koshish ki, fail hua, aur wahi
 * bemtlab wala message dikh gaya.
 *
 * Yaani galti do jagah thi:
 *   1. UI likh raha tha "up to 12 MB" — Vercel par ye kabhi sach tha hi nahi
 *   2. Error message ne asli wajah chhupa di
 *
 * ── HAL: file ko BHEJNE SE PEHLE browser me hi chhota kar do ──────────────
 * Ab 6.6 MB ki photo browser me hi ~200-350 KB ki WebP ban jaati hai aur
 * phir server par jaati hai. Faayde:
 *
 *   • 4.5 MB ki deewar kabhi aati hi nahi — 100 MP ka photo bhi chalega
 *   • Patna ke 4G par upload 20 guna tez (6.6 MB vs 250 KB)
 *   • server par sharp ka kaam na ke barabar — function timeout nahi hota
 *   • owner ne jo maanga: "jitna ratio isko chahyie utna khud le lega"
 *     — har slot ka apna ratio yahin crop ho jaata hai
 *
 * ── SERVER WALA COMPRESSION HATAYA NAHI GAYA ─────────────────────────────
 * media.service.ts ab bhi WebP banata hai. Wo dusri suraksha ki parat hai
 * (API seedha curl se bhi call ho sakta hai). Dono chalna theek hai —
 * pehle se WebP ko dobara encode karne me quality ka nuksaan na ke barabar
 * hota hai aur bytes lagbhag utne hi rehte hain.
 *
 * ── QUALITY KA WAADA ─────────────────────────────────────────────────────
 * Owner: "kitni bhi high quality ki image upload karu"
 * Ghabrane ki baat nahi — output hamesha slot ki poori zaroori size me banta
 * hai (banner 1600px chaudi). Screen par usse zyada pixel dikhte hi nahi.
 * Jo pixel katte hain wo woh hain jo browser waise bhi phenk deta.
 */

export interface PrepareOptions {
  /** Slot ki asli chaudai (px). Image isse badi nahi banegi. */
  targetWidth: number;
  /** Slot ki asli unchai (px). Ratio isi se nikalta hai. */
  targetHeight: number;
  /**
   * 'cover'   = frame poora bharo, bahar ka hissa kat jayega (banner ke liye)
   * 'contain' = poori image rahegi, kinare par khaali jagah aa sakti hai
   */
  fit?: 'cover' | 'contain';
  /** WebP quality 0–1. 0.86 par aankh se farak nahi dikhta. */
  quality?: number;
  /** contain me kinare ka rang. 'transparent' PNG/WebP me chalega. */
  background?: string;
}

export interface PrepareResult {
  file: File;
  originalBytes: number;
  bytes: number;
  width: number;
  height: number;
  /** Kya sach me kuch kata? (cover me ratio alag ho to haan) */
  cropped: boolean;
  /** Browser image nahi padh paya (HEIC wagairah) — original hi bhej do. */
  skipped: boolean;
  skipReason?: string;
  outputType: string;
}

/** Browser WebP encode kar sakta hai ya nahi — ek baar jaanch ke yaad rakho. */
let webpSupport: boolean | null = null;
function canEncodeWebp(): boolean {
  if (webpSupport !== null) return webpSupport;
  try {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    webpSupport = c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    webpSupport = false;
  }
  return webpSupport;
}

function toBlobAsync(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Ek file ko slot ke hisaab se chhota + sahi ratio + WebP me badal deta hai.
 *
 * Kabhi throw nahi karta. Agar kuch bhi gadbad ho (purana browser, HEIC,
 * canvas block) to `skipped: true` ke saath ASLI file wapas de deta hai —
 * upload rukna nahi chahiye, chahe bada hi kyun na jaye.
 */
export async function prepareImageForUpload(
  file: File,
  opts: PrepareOptions,
): Promise<PrepareResult> {
  const originalBytes = file.size;
  const fit = opts.fit ?? 'cover';
  const quality = opts.quality ?? 0.86;

  const bail = (reason: string): PrepareResult => ({
    file,
    originalBytes,
    bytes: originalBytes,
    width: 0,
    height: 0,
    cropped: false,
    skipped: true,
    skipReason: reason,
    outputType: file.type,
  });

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return bail('browser nahi hai');
  }
  if (!file.type.startsWith('image/')) return bail('image file nahi hai');
  // SVG vector hai — usko raster me badalna nuksaan hai.
  if (file.type === 'image/svg+xml') return bail('SVG waise hi rehti hai');

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // iPhone ki HEIC, ya koi aisa format jo ye browser nahi padh sakta.
    return bail('browser is format ko padh nahi paya');
  }

  try {
    const sw = bitmap.width;
    const sh = bitmap.height;
    if (!sw || !sh) return bail('image ki size nahi padh paye');

    const targetRatio = opts.targetWidth / opts.targetHeight;
    const srcRatio = sw / sh;

    // Output kabhi original se bada nahi banega — chhoti image ko stretch
    // karna sirf bytes badhata hai, saaf nahi karta.
    const outW = Math.max(1, Math.min(opts.targetWidth, fit === 'cover' ? Math.round(Math.min(sw, sh * targetRatio)) || opts.targetWidth : sw));
    const outH = Math.max(1, Math.round(outW / targetRatio));

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return bail('canvas nahi mila');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let cropped = false;

    if (fit === 'cover') {
      // Frame poora bharo, jo bahar jaaye wo kaat do. Beech se crop —
      // banner me subject aam taur par beech ya thoda daayein hota hai.
      let cw = sw;
      let ch = sh;
      if (srcRatio > targetRatio) {
        cw = Math.round(sh * targetRatio);   // bahut chaudi — side kategi
        cropped = true;
      } else if (srcRatio < targetRatio) {
        ch = Math.round(sw / targetRatio);   // bahut lambi — upar-neeche katega
        cropped = true;
      }
      const cx = Math.round((sw - cw) / 2);
      const cy = Math.round((sh - ch) / 2);
      ctx.drawImage(bitmap, cx, cy, cw, ch, 0, 0, outW, outH);
    } else {
      // Poori image rakho — kinare par khaali jagah.
      if (opts.background && opts.background !== 'transparent') {
        ctx.fillStyle = opts.background;
        ctx.fillRect(0, 0, outW, outH);
      }
      const scale = Math.min(outW / sw, outH / sh);
      const dw = Math.round(sw * scale);
      const dh = Math.round(sh * scale);
      ctx.drawImage(bitmap, Math.round((outW - dw) / 2), Math.round((outH - dh) / 2), dw, dh);
    }

    const type = canEncodeWebp() ? 'image/webp' : 'image/jpeg';
    let blob = await toBlobAsync(canvas, type, quality);

    // Bahut bhari nikli (bada photo + bahut detail) to ek baar aur kam quality.
    if (blob && blob.size > 1_500_000) {
      const retry = await toBlobAsync(canvas, type, 0.72);
      if (retry && retry.size < blob.size) blob = retry;
    }
    if (!blob) return bail('image encode nahi ho payi');

    // Chhoti file pehle se hi thi aur ratio bhi sahi tha → original hi behtar.
    if (!cropped && blob.size >= originalBytes && originalBytes < 900_000) {
      return bail('original pehle se hi halki thi');
    }

    const ext = type === 'image/webp' ? 'webp' : 'jpg';
    const base = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 80) || 'image';
    const out = new File([blob], `${base}-${outW}x${outH}.${ext}`, {
      type,
      lastModified: Date.now(),
    });

    return {
      file: out,
      originalBytes,
      bytes: out.size,
      width: outW,
      height: outH,
      cropped,
      skipped: false,
      outputType: type,
    };
  } catch (e) {
    return bail(e instanceof Error ? e.message : 'taiyaar karte waqt dikkat');
  } finally {
    bitmap?.close?.();
  }
}

/** "6.6 MB" / "248 KB" */
export function prettySize(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}
