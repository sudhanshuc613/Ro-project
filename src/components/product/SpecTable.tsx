interface Spec {
  specGroup: string;
  specKey: string;
  specValue: string;
}

export default function SpecTable({ specs, className = '' }: { specs: Spec[]; className?: string }) {
  if (!specs.length) {
    return <p className={`text-sm text-muted ${className}`}>Specifications will be updated shortly.</p>;
  }

  const grouped = specs.reduce<Record<string, Spec[]>>((acc, s) => {
    (acc[s.specGroup] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className={`space-y-5 ${className}`}>
      {Object.entries(grouped).map(([group, rows]) => (
        <div key={group} className="overflow-hidden rounded-xl border border-navy-100">
          <div className="bg-navy-50 px-4 py-2.5">
            <h3 className="text-sm font-bold text-navy-700">{group}</h3>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.specKey} className={i % 2 ? 'bg-slate-50/60' : 'bg-white'}>
                  <th scope="row" className="w-1/2 px-4 py-2.5 text-left font-medium text-muted">
                    {r.specKey}
                  </th>
                  <td className="px-4 py-2.5 font-semibold text-navy-700">{r.specValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
