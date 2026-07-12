"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { COMPETITIONS, type CompetitionId } from "@/lib/registrations/config";
import { CompetitionModal } from "./competition-modal";

// Exact Figma SVG for the "Our COMPETITION" Title
const CompetitionTitle: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 1026 144"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#filter0_d_2160_67)">
      <path
        d="M68.77 104.59C45.56 104.59 35 92.3802 35.88 70.6002C36.87 45.7402 48.86 31.0002 71.96 31.0002C95.17 31.0002 105.84 43.2102 104.96 64.9902C103.97 89.8502 91.98 104.59 68.77 104.59ZM67.78 100.19C78.23 100.19 82.52 89.9602 84.94 72.3602C87.47 53.2202 87.14 35.4002 72.95 35.4002C62.72 35.4002 58.32 45.6302 55.9 63.2302C53.26 82.2602 53.7 100.19 67.78 100.19ZM121.2 104.59C112.73 104.59 110.31 100.52 111.63 89.3002L113.94 69.6102C114.93 61.3602 114.93 61.3602 109.32 58.2802L109.54 56.6302C116.8 54.6502 125.49 52.7802 132.97 52.2302C132.42 55.4202 131.54 58.5002 130.77 65.2102L128.35 85.7802C127.47 92.2702 128.02 94.3602 130.44 94.3602C135.17 94.3602 142.43 75.5502 145.62 55.0902C150.35 53.8802 159.26 52.2302 163.55 52.2302C163 54.9802 162.56 57.8402 161.68 65.1002L158.71 88.8602C158.27 92.6002 158.38 93.8102 159.92 93.8102C161.46 93.8102 163.44 91.2802 166.63 84.9002L169.05 85.6702C165.31 99.7502 158.27 104.15 150.57 104.15C142.43 104.15 140.56 100.3 143.31 87.7602L145.51 77.4202H143.86C139.57 92.0502 134.73 104.59 121.2 104.59ZM176.769 103.38C173.689 103.38 173.249 102.39 173.909 97.3302L177.319 69.5002C178.419 61.3602 178.419 61.3602 172.699 58.2802L172.919 56.6302C180.179 54.6502 188.869 52.7802 195.909 52.2302L190.629 78.7402H192.279C197.669 61.5802 201.519 52.3402 209.219 52.3402C212.959 52.3402 214.719 54.6502 214.719 58.2802C214.719 61.1402 213.839 64.8802 210.759 68.4002C209.329 67.4102 207.349 66.4202 204.819 66.3102C201.409 66.2002 198.659 70.0502 196.239 76.5402C193.929 83.1402 191.729 92.1602 190.519 103.38H176.769ZM275.176 104.46C268.11 104.46 261.743 102.893 256.076 99.7602C250.41 96.5602 245.943 92.2268 242.676 86.7602C239.476 81.2268 237.876 75.0268 237.876 68.1602C237.876 61.2935 239.476 55.1268 242.676 49.6602C245.943 44.1268 250.376 39.7935 255.976 36.6602C261.643 33.4602 267.976 31.8602 274.976 31.8602C280.976 31.8602 286.476 33.0602 291.476 35.4602C296.543 37.7935 300.776 41.0935 304.176 45.3602C307.576 49.6268 309.843 54.5268 310.976 60.0602H295.376C293.976 55.7268 291.476 52.3268 287.876 49.8602C284.343 47.3935 280.143 46.1602 275.276 46.1602C271.143 46.1602 267.443 47.0935 264.176 48.9602C260.91 50.7602 258.376 53.3268 256.576 56.6602C254.776 59.9935 253.876 63.8268 253.876 68.1602C253.876 72.4935 254.776 76.3268 256.576 79.6602C258.443 82.9935 261.01 85.5935 264.276 87.4602C267.543 89.2602 271.276 90.1602 275.476 90.1602C280.543 90.1602 284.876 88.8602 288.476 86.2602C292.143 83.5935 294.61 79.9935 295.876 75.4602H311.376C310.31 81.1268 308.076 86.1602 304.676 90.5602C301.343 94.9602 297.11 98.3935 291.976 100.86C286.91 103.26 281.31 104.46 275.176 104.46ZM359.472 104.46C352.339 104.46 345.839 102.893 339.972 99.7602C334.172 96.5602 329.606 92.1935 326.272 86.6602C323.006 81.1268 321.372 74.9602 321.372 68.1602C321.372 61.3602 323.006 55.1935 326.272 49.6602C329.606 44.1268 334.172 39.7935 339.972 36.6602C345.839 33.4602 352.339 31.8602 359.472 31.8602C366.606 31.8602 373.072 33.4602 378.872 36.6602C384.739 39.7935 389.339 44.1268 392.672 49.6602C396.006 55.1935 397.672 61.3602 397.672 68.1602C397.672 74.9602 396.006 81.1268 392.672 86.6602C389.339 92.1935 384.739 96.5602 378.872 99.7602C373.072 102.893 366.606 104.46 359.472 104.46ZM359.472 90.1602C363.739 90.1602 367.539 89.2268 370.872 87.3602C374.272 85.4935 376.906 82.8935 378.772 79.5602C380.639 76.2268 381.572 72.4268 381.572 68.1602C381.572 63.8935 380.639 60.0935 378.772 56.7602C376.906 53.4268 374.272 50.8268 370.872 48.9602C367.539 47.0935 363.739 46.1602 359.472 46.1602C355.206 46.1602 351.372 47.0935 347.972 48.9602C344.639 50.8268 342.039 53.4268 340.172 56.7602C338.306 60.0935 337.372 63.8935 337.372 68.1602C337.372 72.4268 338.306 76.2268 340.172 79.5602C342.039 82.8935 344.639 85.4935 347.972 87.3602C351.372 89.2268 355.206 90.1602 359.472 90.1602ZM408.003 103.16L417.103 33.1602H434.803C439.936 43.5602 443.736 51.5268 446.203 57.0602C448.67 62.5935 450.37 67.1268 451.303 70.6602C452.303 74.1935 452.936 77.7935 453.203 81.4602H457.603C457.87 77.7935 458.47 74.1935 459.403 70.6602C460.403 67.1268 462.136 62.5935 464.603 57.0602C467.07 51.5268 470.87 43.5602 476.003 33.1602H493.703L502.903 103.16H486.703C485.636 94.2935 484.87 87.2268 484.403 81.9602C484.003 76.6935 483.803 72.2268 483.803 68.5602C483.803 65.2935 483.97 62.2602 484.303 59.4602C484.636 56.6602 485.17 53.4602 485.903 49.8602L481.203 48.8602C480.136 53.5935 479.003 57.7268 477.803 61.2602C476.603 64.7935 474.836 68.9935 472.503 73.8602C470.17 78.7268 466.603 85.6602 461.803 94.6602H449.003C444.203 85.6602 440.636 78.7268 438.303 73.8602C435.97 68.9935 434.203 64.7935 433.003 61.2602C431.803 57.7268 430.67 53.5935 429.603 48.8602L424.903 49.8602C425.636 53.4602 426.17 56.6602 426.503 59.4602C426.836 62.1935 427.003 65.1602 427.003 68.3602C427.003 72.0935 426.77 76.5935 426.303 81.8602C425.903 87.1268 425.17 94.2268 424.103 103.16H408.003ZM516.555 33.1602H544.855C550.255 33.1602 554.989 34.1935 559.055 36.2602C563.189 38.3268 566.355 41.2602 568.555 45.0602C570.822 48.7935 571.955 53.1268 571.955 58.0602C571.955 62.9935 570.822 67.3602 568.555 71.1602C566.355 74.8935 563.189 77.7935 559.055 79.8602C554.989 81.9268 550.289 82.9602 544.955 82.9602H532.155V103.16H516.555V33.1602ZM543.055 70.1602C547.522 70.1602 550.889 69.1602 553.155 67.1602C555.489 65.0935 556.655 62.0935 556.655 58.1602C556.655 54.2268 555.489 51.2602 553.155 49.2602C550.889 47.2602 547.522 46.2602 543.055 46.2602H531.855V70.1602H543.055ZM584.329 33.1602H631.529V45.5602H599.829V61.4602H627.729V73.6602H599.829V90.6602H632.429V103.16H584.329V33.1602ZM662.459 47.1602H640.559V33.1602H699.959V47.1602H678.059V103.16H662.459V47.1602ZM711.086 33.1602H726.686V103.16H711.086V33.1602ZM759.92 47.1602H738.02V33.1602H797.42V47.1602H775.52V103.16H759.92V47.1602ZM808.547 33.1602H824.147V103.16H808.547V33.1602ZM875.781 104.46C868.648 104.46 862.148 102.893 856.281 99.7602C850.481 96.5602 845.914 92.1935 842.581 86.6602C839.314 81.1268 837.681 74.9602 837.681 68.1602C837.681 61.3602 839.314 55.1935 842.581 49.6602C845.914 44.1268 850.481 39.7935 856.281 36.6602C862.148 33.4602 868.648 31.8602 875.781 31.8602C882.914 31.8602 889.381 33.4602 895.181 36.6602C901.048 39.7935 905.648 44.1268 908.981 49.6602C912.314 55.1935 913.981 61.3602 913.981 68.1602C913.981 74.9602 912.314 81.1268 908.981 86.6602C905.648 92.1935 901.048 96.5602 895.181 99.7602C889.381 102.893 882.914 104.46 875.781 104.46ZM875.781 90.1602C880.048 90.1602 883.848 89.2268 887.181 87.3602C890.581 85.4935 893.214 82.8935 895.081 79.5602C896.948 76.2268 897.881 72.4268 897.881 68.1602C897.881 63.8935 896.948 60.0935 895.081 56.7602C893.214 53.4268 890.581 50.8268 887.181 48.9602C883.848 47.0935 880.048 46.1602 875.781 46.1602C871.514 46.1602 867.681 47.0935 864.281 48.9602C860.948 50.8268 858.348 53.4268 856.481 56.7602C854.614 60.0935 853.681 63.8935 853.681 68.1602C853.681 72.4268 854.614 76.2268 856.481 79.5602C858.348 82.8935 860.948 85.4935 864.281 87.3602C867.681 89.2268 871.514 90.1602 875.781 90.1602ZM927.297 103.16V33.1602H942.697C953.231 47.4935 960.764 58.2268 965.297 65.3602C969.897 72.4268 973.664 79.3602 976.597 86.1602L980.897 84.3602C979.231 79.5602 977.997 75.3602 977.197 71.7602C976.397 68.0935 975.831 63.7602 975.497 58.7602C975.231 53.7602 975.097 46.6935 975.097 37.5602V33.1602H990.597V103.16H975.197C964.597 88.8268 957.031 78.0935 952.497 70.9602C948.031 63.8268 944.331 56.8935 941.397 50.1602L936.997 51.9602C938.664 56.7602 939.897 60.9935 940.697 64.6602C941.497 68.2602 942.031 72.5602 942.297 77.5602C942.631 82.5602 942.797 89.6268 942.797 98.7602V103.16H927.297Z"
        fill="url(#paint0_linear_2160_67)"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_2160_67"
        x="0"
        y="0"
        width="1025.6"
        height="143.59"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="17.5" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.0205769 0 0 0 0 0.308654 0 0 0 0 0 0 0 0 0.69 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_2160_67"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_2160_67"
          result="shape"
        />
      </filter>
      <linearGradient
        id="paint0_linear_2160_67"
        x1="921.06"
        y1="8.66016"
        x2="908.612"
        y2="204.946"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="rgb(var(--brand-cream))" />
        <stop offset="1" stopColor="rgb(var(--brand-lime))" />
      </linearGradient>
    </defs>
  </svg>
);

// Props for each competition card component
interface CompetitionCardProps {
  title: string;
  description: string;
  logoSrc: string;
  titleGradient: string;
  descGradient: string;
  onDetails: () => void;
}

// Custom reusable card component built using exact Figma values
const CompetitionCard: React.FC<CompetitionCardProps> = ({
  title,
  description,
  logoSrc,
  titleGradient,
  descGradient,
  onDetails,
}) => {
  return (
    <div
      className="group relative flex flex-col sm:flex-row items-center p-6 gap-6 overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        width: "100%",
        maxWidth: "537px",
        minHeight: "299px",
        background:
          "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)",
        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.45)",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      {/* ambient corner glow, brightens on hover */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-brand-lime/30 to-brand-teal/0 blur-3xl transition-opacity duration-300 opacity-60 group-hover:opacity-100" />

      {/* Left side: competition logo, glowing on a dark glass badge */}
      <div
        className="relative flex-shrink-0 flex items-center justify-center rounded-2xl p-4 ring-1 ring-brand-lime/30 transition-all duration-300 group-hover:ring-brand-lime/60"
        style={{
          width: "150px",
          height: "150px",
          background:
            "radial-gradient(circle at 30% 20%, rgba(var(--brand-teal-mid),0.55), rgba(var(--brand-green),0.85))",
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 30px -6px rgba(227,239,38,0.35)",
        }}
      >
        <Image
          src={logoSrc}
          alt={`${title} logo`}
          width={110}
          height={110}
          style={{ width: "auto", height: "auto" }}
          className="max-h-full max-w-full object-contain drop-shadow-[0_0_18px_rgba(227,239,38,0.35)]"
        />
      </div>

      {/* Right side: Texts & Details button */}
      <div className="relative flex flex-col justify-between h-full flex-1 w-full gap-6 sm:gap-2 min-h-[176px]">
        <div className="flex flex-col gap-2">
          {/* Card Title with exact Figma gradient */}
          <h4
            style={{
              fontFamily: "var(--font-oddval), sans-serif",
              fontWeight: 600,
              fontSize: "35px",
              lineHeight: "54px",
              backgroundImage: titleGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </h4>

          {/* Description text with exact Figma gradient */}
          <p
            style={{
              fontFamily: "'SF Pro', ui-sans-serif, sans-serif",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "19px",
              backgroundImage: descGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {description}
          </p>
        </div>

        {/* Button styled with exact gradients and rounded corner radius */}
        <button
          onClick={onDetails}
          className="flex items-center justify-center gap-2 transition-all hover:brightness-110 shadow-sm mt-auto sm:mt-4"
          style={{
            width: "214px",
            height: "48px",
            background: "linear-gradient(214.92deg, rgb(var(--brand-cream)) 4.89%, rgb(var(--brand-lime)) 97.74%)",
            borderRadius: "10px",
          }}
        >
          <span
            style={{
              fontFamily: "'SF Pro', ui-sans-serif, sans-serif",
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "19px",
              color: "rgb(var(--brand-teal))",
            }}
          >
            See Details
          </span>
          <ArrowRight className="h-5 w-5 stroke-[3] text-brand-teal" />
        </button>
      </div>
    </div>
  );
};

export default function CompetitionSection() {
  const [openId, setOpenId] = useState<CompetitionId | null>(null);

  return (
    <section className="relative w-full py-16 px-4 md:px-8 max-w-[1440px] mx-auto overflow-hidden min-h-[1000px] flex flex-col items-center">

      {/* Title block using exact SVG */}
      <div className="flex justify-center w-full mb-8 md:mb-12 z-10 px-2 md:px-0">
        <CompetitionTitle className="w-full max-w-[800px] lg:max-w-[1026px] h-auto drop-shadow-xl" />
      </div>

      <div className="w-full max-w-[1150px] flex flex-col items-center z-10">
        {/* ======================================================= */}
        {/* UNDERGRADUATE CATEGORY                                    */}
        {/* ======================================================= */}
        <div className="mb-12 w-full flex flex-col items-center">
          <h3
            className="mb-6 select-none text-center tracking-wide"
            style={{
              fontFamily: "var(--font-oddval), sans-serif",
              fontWeight: 600,
              fontSize: "35px",
              lineHeight: "54px",
              color: "rgb(var(--brand-butter))",
              textShadow: "4px 4px 35px rgba(0, 0, 0, 0.35)",
            }}
          >
            Undergraduate
          </h3>

          {/* Grid container matching exact 537px card bounds */}
          <div className="flex flex-col xl:flex-row gap-8 justify-center items-center w-full">
            <CompetitionCard
              title="Medhack"
              logoSrc={COMPETITIONS.medhack.logo}
              onDetails={() => setOpenId("medhack")}
              titleGradient="linear-gradient(227.28deg, rgb(var(--brand-lime)) 8.58%, rgb(var(--brand-teal)) 52.85%, rgb(var(--brand-green)) 87.95%)"
              description="A team hackathon competition (3–5 participants) that challenges participants to develop healthcare-technology-based business solutions by designing an innovative, impactful business model and digital product."
              descGradient="linear-gradient(269.27deg, rgb(var(--brand-cream)) 69.75%, rgb(var(--brand-lime)) 155.54%)"
            />
            <CompetitionCard
              title="Healthineer"
              logoSrc={COMPETITIONS.healthineer.logo}
              onDetails={() => setOpenId("healthineer")}
              titleGradient="linear-gradient(227.28deg, rgb(var(--brand-lime)) 8.58%, rgb(var(--brand-teal)) 52.85%, rgb(var(--brand-green)) 87.95%)"
              description="A team competition (3–5 participants) to develop healthcare technology solutions in the form of an innovative, applicable scientific paper and prototype with real implementation potential."
              descGradient="linear-gradient(269.27deg, rgb(var(--brand-cream)) 69.75%, rgb(var(--brand-lime)) 155.54%)"
            />
          </div>
        </div>

        {/* ======================================================= */}
        {/* HIGHSCHOOL CATEGORY                                       */}
        {/* ======================================================= */}
        <div className="w-full flex flex-col items-center">
          <h3
            className="mb-6 select-none text-center tracking-wide"
            style={{
              fontFamily: "var(--font-oddval), sans-serif",
              fontWeight: 600,
              fontSize: "35px",
              lineHeight: "54px",
              color: "rgb(var(--brand-butter))",
              textShadow: "4px 4px 35px rgba(0, 0, 0, 0.37)",
            }}
          >
            Highschool
          </h3>

          <div className="flex justify-center items-center w-full">
            <CompetitionCard
              title="Healthynovation"
              logoSrc={COMPETITIONS.healthynovation.logo}
              onDetails={() => setOpenId("healthynovation")}
              titleGradient="linear-gradient(72.46deg, rgb(var(--brand-cream)) -51.59%, rgb(var(--brand-lime)) -46.93%, rgb(var(--brand-teal)) 45.25%)"
              description="A scientific paper competition for highschool students (1–3 participants) that encourages innovative ideas to address healthcare challenges through a scientific paper and poster."
              descGradient="linear-gradient(260.23deg, rgb(var(--brand-cream)) 60.52%, rgb(var(--brand-lime)) 128%)"
            />
          </div>
        </div>
      </div>

      <CompetitionModal competitionId={openId} onClose={() => setOpenId(null)} />
    </section>
  );
}