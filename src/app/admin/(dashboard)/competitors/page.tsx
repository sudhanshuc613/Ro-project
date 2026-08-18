import CompetitorWatch from '@/components/admin/CompetitorWatch';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Competitor Watch' };

export default function CompetitorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Competitor Watch</h1>
        <p className="mt-0.5 text-sm text-muted">
          Live check — hum kahan rank karte hain, upar kaun hai, kaun ad chala raha hai,
          aur agla kaam kya hai.
        </p>
      </div>

      <CompetitorWatch />
    </div>
  );
}
