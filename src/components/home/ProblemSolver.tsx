'use client';

/**
 * ProblemSolver — the most important conversion block on the site.
 *
 * WHY THIS EXISTS:
 * A customer whose RO stopped working does not search "RO service". They think
 * "paani nahi aa raha", "leak ho raha hai", "taste kharab hai". Every competitor
 * site leads with a generic service list. This block speaks the customer's
 * actual words, tells them the likely cause and honest cost BEFORE they call,
 * then gives one tap to WhatsApp with the problem pre-filled.
 *
 * The honesty is deliberate: showing "this might cost ₹1,800" builds more trust
 * than hiding it, and it filters out price-shock cancellations on the doorstep.
 */
import { useState } from 'react';
import { CONTACT, SERVICE } from '@/lib/constants';

interface Problem {
  id: string;
  emoji: string;
  title: string;
  hindi: string;
  symptoms: string[];
  likelyCause: string;
  cost: string;
  fixTime: string;
  diy: string;
}

const PROBLEMS: Problem[] = [
  {
    id: 'no-water',
    emoji: '🚱',
    title: 'No water coming out',
    hindi: 'पानी नहीं आ रहा',
    symptoms: ['Machine runs but tank stays empty', 'Very slow drip from tap', 'Tank fills after many hours'],
    likelyCause: 'Choked RO membrane or a failed booster pump. In low-pressure areas like Kadamkuan it is often just missing pump pressure.',
    cost: '₹850 – ₹2,400',
    fixTime: '30–45 min',
    diy: 'Check the inlet tap is fully open and the adaptor light is on. If both are fine, it needs a technician.',
  },
  {
    id: 'leakage',
    emoji: '💧',
    title: 'Water leaking',
    hindi: 'पानी लीक हो रहा है',
    symptoms: ['Drip from bottom of unit', 'Wet wall behind machine', 'Puddle under the purifier'],
    likelyCause: 'Perished O-ring, cracked filter housing, or a loose elbow connector — very common where the original fitting was done cheaply.',
    cost: '₹250 – ₹900',
    fixTime: '20–30 min',
    diy: 'Switch off the inlet tap immediately to stop water damage, then call. Do not run the machine.',
  },
  {
    id: 'bad-taste',
    emoji: '😖',
    title: 'Bad taste or smell',
    hindi: 'पानी का स्वाद खराब',
    symptoms: ['Salty or bitter taste', 'Smells like chlorine or mud', 'Water looks slightly yellow'],
    likelyCause: 'Exhausted carbon filter, or a punctured membrane letting TDS bypass. Yellow tint usually means iron — common in Rajendra Nagar and Phulwari.',
    cost: '₹400 – ₹2,600',
    fixTime: '30–40 min',
    diy: 'Stop drinking it. We check TDS free on the visit — that tells us in 30 seconds whether it is the filter or the membrane.',
  },
  {
    id: 'noise',
    emoji: '🔊',
    title: 'Loud noise from machine',
    hindi: 'मशीन से आवाज़ आ रही है',
    symptoms: ['Grinding or humming sound', 'Vibration on the wall', 'Noise even when tank is full'],
    likelyCause: 'Worn pump diaphragm, loose mounting bracket, or a faulty high-pressure switch that keeps the motor running.',
    cost: '₹450 – ₹1,800',
    fixTime: '30–45 min',
    diy: 'If the motor runs non-stop even with a full tank, switch it off at the plug — running dry damages the pump further.',
  },
  {
    id: 'wastage',
    emoji: '🚰',
    title: 'Too much water wastage',
    hindi: 'बहुत पानी बर्बाद हो रहा है',
    symptoms: ['Drain pipe runs constantly', 'Reject water much more than purified', 'Water bill gone up'],
    likelyCause: 'Wrong or worn flow restrictor. In high-TDS areas like Gola Road and Danapur some wastage is normal, but not continuous flow.',
    cost: '₹300 – ₹800',
    fixTime: '20 min',
    diy: 'Some reject water is normal — roughly 1 glass wasted per 1 glass purified. More than 3:1 needs adjustment.',
  },
  {
    id: 'not-starting',
    emoji: '⚡',
    title: 'Machine not switching on',
    hindi: 'मशीन चालू नहीं हो रही',
    symptoms: ['No indicator light', 'Display blank', 'Dead even after switching socket'],
    likelyCause: 'SMPS adaptor failure — the single most common electrical fault. Frequent in Kumhrar and Bypass Road where voltage fluctuates.',
    cost: '₹700 – ₹1,300',
    fixTime: '20–30 min',
    diy: 'Try a different socket first. If still dead, it is the SMPS — we carry spares for all major brands.',
  },
];

export default function ProblemSolver() {
  const [open, setOpen] = useState<string | null>('no-water');

  return (
    <section className="bg-white py-14 md:py-16" aria-labelledby="problem-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-orange-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-cta-orange">
            Aapki problem kya hai?
          </span>
          <h2 id="problem-heading" className="mt-3 font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
            Tell Us the Problem — We&apos;ll Tell You the Cost First
          </h2>
          <p className="mt-2 text-muted">
            No surprises on the doorstep. Tap your problem to see the likely cause,
            honest price range, and how long it takes.
          </p>
        </div>

        <div className="mx-auto mt-9 max-w-4xl space-y-3">
          {PROBLEMS.map((p) => {
            const isOpen = open === p.id;
            return (
              <div
                key={p.id}
                className={`overflow-hidden rounded-2xl border-2 transition ${
                  isOpen ? 'border-aqua-400 shadow-card' : 'border-navy-100'
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : p.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-navy-50"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-aqua-50 text-2xl">
                    {p.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-bold text-navy-700">{p.title}</span>
                    <span className="block text-sm text-muted">{p.hindi}</span>
                  </span>
                  <span className="hidden shrink-0 text-right sm:block">
                    <span className="block text-xs text-muted">Usually costs</span>
                    <span className="block font-bold text-cta-green">{p.cost}</span>
                  </span>
                  <span className={`shrink-0 text-xl text-aqua-500 transition-transform ${isOpen ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>

                <div className="grid transition-all duration-300" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                  <div className="overflow-hidden">
                    <div className="border-t border-navy-50 p-5">
                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-muted">You&apos;ll notice</p>
                          <ul className="mt-2 space-y-1.5">
                            {p.symptoms.map((s) => (
                              <li key={s} className="flex gap-2 text-sm text-navy-600">
                                <span className="text-aqua-500">•</span> {s}
                              </li>
                            ))}
                          </ul>

                          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted">Likely cause</p>
                          <p className="mt-1.5 text-sm text-navy-600">{p.likelyCause}</p>
                        </div>

                        <div>
                          <div className="rounded-xl bg-navy-50 p-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted">Repair cost</span>
                              <span className="font-bold text-cta-green">{p.cost}</span>
                            </div>
                            <div className="mt-2 flex justify-between text-sm">
                              <span className="text-muted">Visit charge</span>
                              <span className="font-bold text-navy-700">₹{SERVICE.visitCharge}</span>
                            </div>
                            <div className="mt-2 flex justify-between text-sm">
                              <span className="text-muted">Time needed</span>
                              <span className="font-bold text-navy-700">{p.fixTime}</span>
                            </div>
                          </div>

                          <div className="mt-3 rounded-xl bg-amber-50 p-3">
                            <p className="text-xs font-bold text-amber-800">💡 Try this first (free)</p>
                            <p className="mt-1 text-sm text-amber-900">{p.diy}</p>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <a
                              href={CONTACT.primaryTel}
                              data-analytics={`problem_call_${p.id}`}
                              className="flex-1 rounded-lg bg-cta-green px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-cta-greenDark"
                            >
                              📞 Call now
                            </a>
                            <a
                              href={CONTACT.whatsappLink(
                                `Hi Aqua Perl, my RO problem: ${p.title} (${p.hindi}). I am in Patna. Please send a technician.`,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-analytics={`problem_wa_${p.id}`}
                              className="flex-1 rounded-lg bg-[#25D366] px-4 py-2.5 text-center text-sm font-bold text-white transition hover:brightness-95"
                            >
                              💬 WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted">
          Problem list mein nahi hai? Koi baat nahi —{' '}
          <a href={CONTACT.primaryTel} className="font-bold text-aqua-600 hover:underline">
            call {CONTACT.primaryPhone}
          </a>{' '}
          and describe it. We diagnose free during the ₹{SERVICE.visitCharge} visit.
        </p>
      </div>
    </section>
  );
}
