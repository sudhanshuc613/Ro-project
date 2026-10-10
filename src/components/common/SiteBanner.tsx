/**
 * SITE BANNER — ek slot ki image + uske upar tairta phone number.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ek hi jagah jo ye teen cheezein sambhalti hai:
 *
 *   1. IMAGE KAHAN SE AAYE — admin ne `/admin/site-images` se badli hai to
 *      wahi, warna code ka default. Caller ko sochna nahi padta.
 *
 *   2. RATIO FIX RAHE — `aspect-ratio` CSS se dabba pehle se apni jagah le
 *      leta hai, isliye image load hone par page nahi khiskta (CLS = 0).
 *      Upload ke waqt image isi ratio me cut hoti bhi hai, to image khinchi
 *      hui nahi dikhegi.
 *
 *   3. PHONE NUMBER UPAR RAHE — chahe owner kitni bhi images badle.
 *      Isi ke liye owner ne kaha tha: *"kitni bhi image laga lu, no uske
 *      upper hi rahe chahyie"*.
 *
 * `object-cover` isliye ki agar kabhi koi purani image slot ke ratio se alag
 * ho (jaise aaj ke saved banner), to woh khinch ke bedaul na ho — bas kinare
 * se halka crop ho jayega.
 */
import Image from 'next/image';
import BannerPhoneBadge, { type BadgePosition } from '@/components/common/BannerPhoneBadge';

export default function SiteBanner({
  src,
  alt,
  width,
  height,
  priority = false,
  rounded = 'rounded-2xl',
  sizes = '100vw',
  showPhone = true,
  phonePosition = 'bottom-center',
  className = '',
  imgClassName = '',
  children,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  rounded?: string;
  sizes?: string;
  /** false sirf tab jab us jagah pehle se koi phone CTA maujood ho. */
  showPhone?: boolean;
  phonePosition?: BadgePosition;
  className?: string;
  imgClassName?: string;
  /** Upar aur kuch daalna ho (badge, ribbon) to yahan. */
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden ${rounded} ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        fetchPriority={priority ? 'high' : 'auto'}
        sizes={sizes}
        className={`object-cover ${imgClassName}`}
      />
      {children}
      {showPhone && <BannerPhoneBadge position={phonePosition} />}
    </div>
  );
}
