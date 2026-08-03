const REVIEWS = [
  {
    stars: 5,
    body: 'Called at 11 AM, technician reached Kankarbagh by 12:30. Replaced the membrane and explained everything. Only ₹100 visit charge as promised — no hidden costs.',
    name: 'Rajesh Kumar',
    place: 'Kankarbagh, Patna',
    initials: 'RK',
  },
  {
    stars: 5,
    body: 'Ordered a booster pump for my shop in Ranchi. Delivered in 3 days, genuine part, perfectly packed. WhatsApp updates at every step were really helpful.',
    name: 'Sunita Prasad',
    place: 'Ranchi, Jharkhand',
    initials: 'SP',
  },
  {
    stars: 4,
    body: 'Installed a 250 LPH commercial plant at our restaurant in Boring Road. Free site survey, clean installation and AMC included. Very professional team.',
    name: 'Md. Arshad',
    place: 'Boring Road, Patna',
    initials: 'MA',
  },
];

export default function Testimonials() {
  return (
    <section className="py-14 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold text-navy-700">What Our Customers Say</h2>
          <p className="mt-2 text-muted">4.8★ average from 312 verified reviews</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="rounded-2xl border border-navy-100 bg-white p-6">
              <div className="text-lg tracking-widest text-amber-400" aria-label={`${r.stars} out of 5 stars`}>
                {'★'.repeat(r.stars)}
                <span className="text-slate-200">{'★'.repeat(5 - r.stars)}</span>
              </div>
              <blockquote className="my-4 text-sm leading-relaxed text-navy-500">
                &ldquo;{r.body}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-aqua-50 text-sm font-bold text-aqua-600">
                  {r.initials}
                </span>
                <span>
                  <span className="block text-sm font-bold text-navy-700">{r.name}</span>
                  <span className="block text-xs text-muted">{r.place}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
