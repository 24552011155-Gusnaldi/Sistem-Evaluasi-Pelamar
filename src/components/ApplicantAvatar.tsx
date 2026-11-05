"use client";

import Image from "next/image";
import { useState } from "react";

const avatarColors = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

function colorForName(name: string) {
  const hash = Array.from(name).reduce((value, character) => value + character.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

export default function ApplicantAvatar({ name, photoUrl, size = 40 }: { name: string; photoUrl?: string; size?: number }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
  const showPhoto = photoUrl && !imageFailed;

  return (
    <span
      aria-label={`Foto ${name}`}
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full text-sm font-bold ${showPhoto ? "bg-slate-100 text-transparent" : colorForName(name)}`}
      role="img"
      style={{ width: size, height: size }}
    >
      {showPhoto ? (
        <Image alt="" className="object-cover" fill onError={() => setImageFailed(true)} sizes={`${size}px`} src={photoUrl} unoptimized />
      ) : initials}
    </span>
  );
}
