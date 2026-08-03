const STEPS = [
  { n: 1, title: 'Book or Call', desc: 'Fill the 40-second form or call us directly. No advance payment.' },
  { n: 2, title: 'We Confirm', desc: 'Our team calls within 30 minutes and assigns your nearest technician.' },
  { n: 3, title: 'Doorstep Visit', desc: 'Technician arrives within 90 minutes, diagnoses and quotes before working.' },
  { n: 4, title: 'Fixed & Warranted', desc: 'Pay after the job is done. 30-day warranty on every repair.' },
];

export default function HowItWorks() {
  return (
    <section className="bg-navy-50 py-14 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold text-navy-700">
            How Our Patna Service Works
          </h2>
          <p className="mt-2 text-muted">From your call to clean water — usually the same day</p>
        </div>

        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl bg-white p-6 text-center shadow-card">
              <span className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-full bg-aqua-500 font-display text-base font-extrabold text-white">
                {s.n}
              </span>
              <h3 className="font-display text-base font-bold text-navy-700">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
