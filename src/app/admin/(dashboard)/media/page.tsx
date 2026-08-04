/**
 * Media Library — upload and manage images without touching GitHub.
 *
 * This page exists because the previous flow was: put the file in
 * public/products/ on GitHub, commit, wait for a redeploy, then paste the
 * path into the product form. That is a developer workflow, not a shop
 * owner's workflow. Now it is: drag photo → done.
 */
import type { Metadata } from 'next';
import { listMedia } from '@/server/services/media.service';
import MediaLibrary from '@/components/admin/MediaLibrary';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Images',
  robots: { index: false, follow: false },
};

export default async function MediaPage() {
  const items = await listMedia();
  const totalBytes = items.reduce((s, i) => s + i.bytes, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-700">Images</h1>
        <p className="mt-1 text-sm text-muted">
          Upload photos straight from this computer or your phone. No GitHub, no redeploy.
        </p>
      </div>

      <MediaLibrary initialItems={items} totalBytes={totalBytes} />
    </div>
  );
}
