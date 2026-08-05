'use client';

/**
 * PasswordInput — password field with a show/hide (eye) toggle.
 *
 * Kyun banaya: mobile pe password type karte waqt galti hoti hai aur
 * user ko dikhta nahi ki usne kya likha. Ye India mein #1 reason hai
 * ki log login chhod dete hain.
 *
 * Security notes:
 *  - Toggle sirf local state hai, kahin bheja nahi jaata.
 *  - Field default hamesha `password` (chhupa hua) rehta hai.
 *  - `data-1p-ignore` nahi lagaya — password managers kaam karte rahenge.
 */
import { useId, useState } from 'react';

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Extra classes for the <input> itself. */
  className?: string;
  /** Wrapper classes (rarely needed). */
  wrapperClassName?: string;
}

export default function PasswordInput({
  className = 'input',
  wrapperClassName = '',
  ...props
}: Props) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div className={`relative ${wrapperClassName}`}>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`${className} pr-12`}
        aria-describedby={`${id}-toggle`}
      />
      <button
        id={`${id}-toggle`}
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        title={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
        className="absolute right-1 top-1/2 grid h-9 w-10 -translate-y-1/2 place-items-center rounded-lg text-navy-400 transition hover:bg-navy-50 hover:text-navy-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500"
      >
        {visible ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}

const Eye = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1 1 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOff = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.774 3.162 10.066 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);
