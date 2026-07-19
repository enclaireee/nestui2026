"use client";

import React from "react";

// Exact SVG for the Timeline Title
const TimelineTitle: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 520 146"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#filter0_d_2160_100)">
      <path
        d="M56.9 49.1001H35V35.1001H94.4V49.1001H72.5V105.1H56.9V49.1001ZM102.972 54.6001H117.772V105.1H102.972V54.6001ZM101.672 31.0001H118.772V46.0001H101.672V31.0001ZM132.562 54.6001H147.162C147.028 56.3334 146.695 57.9668 146.162 59.5001C145.628 61.0334 144.762 62.9001 143.562 65.1001L147.862 67.4001C149.795 62.6668 152.162 59.2001 154.962 57.0001C157.762 54.7334 161.095 53.6001 164.962 53.6001C169.095 53.6001 172.462 54.8001 175.062 57.2001C177.728 59.6001 179.428 62.9001 180.162 67.1001H184.062C184.595 63.0334 186.395 59.7668 189.462 57.3001C192.595 54.8334 196.362 53.6001 200.762 53.6001C206.295 53.6001 210.662 55.5668 213.862 59.5001C217.062 63.4334 218.662 68.8001 218.662 75.6001V105.1H203.862V78.8001C203.862 74.7334 202.962 71.6334 201.162 69.5001C199.428 67.3001 196.895 66.2001 193.562 66.2001C190.162 66.2001 187.495 67.3334 185.562 69.6001C183.695 71.8001 182.762 74.9334 182.762 79.0001V105.1H168.462V78.8001C168.462 74.7334 167.562 71.6334 165.762 69.5001C164.028 67.3001 161.495 66.2001 158.162 66.2001C154.762 66.2001 152.095 67.3334 150.162 69.6001C148.295 71.8001 147.362 74.9334 147.362 79.0001V105.1H132.562V54.6001ZM258.062 106.4C252.662 106.4 247.795 105.267 243.462 103C239.195 100.667 235.828 97.5001 233.362 93.5001C230.962 89.5001 229.762 84.9668 229.762 79.9001C229.762 74.8334 230.962 70.3001 233.362 66.3001C235.828 62.2334 239.228 59.0668 243.562 56.8001C247.895 54.5334 252.762 53.4001 258.162 53.4001C263.628 53.4001 268.528 54.5668 272.862 56.9001C277.195 59.1668 280.562 62.3334 282.962 66.4001C285.362 70.4001 286.562 74.9334 286.562 80.0001C286.562 81.4668 286.462 82.9668 286.262 84.5001H244.162C244.828 87.7001 246.395 90.2668 248.862 92.2001C251.395 94.1334 254.462 95.1001 258.062 95.1001C260.728 95.1001 263.128 94.6001 265.262 93.6001C267.395 92.5334 269.128 91.0334 270.462 89.1001H285.162C283.162 94.4334 279.728 98.6668 274.862 101.8C270.062 104.867 264.462 106.4 258.062 106.4ZM272.362 75.4001C271.628 72.0668 269.995 69.4334 267.462 67.5001C264.928 65.5668 261.828 64.6001 258.162 64.6001C254.495 64.6001 251.395 65.6001 248.862 67.6001C246.395 69.5334 244.795 72.1334 244.062 75.4001H272.362ZM325.077 105C322.811 105.2 320.711 105.3 318.777 105.3C311.311 105.3 305.977 103.767 302.777 100.7C299.577 97.6334 297.977 92.6668 297.977 85.8001V35.1001H312.777V83.6001C312.777 86.7334 313.244 88.9001 314.177 90.1001C315.177 91.2334 317.177 91.8001 320.177 91.8001C321.577 91.8001 323.211 91.7001 325.077 91.5001V105ZM335.882 54.6001H350.682V105.1H335.882V54.6001ZM334.582 31.0001H351.682V46.0001H334.582V31.0001ZM365.472 54.6001H380.072C379.939 56.5334 379.605 58.3001 379.072 59.9001C378.605 61.5001 377.805 63.2668 376.672 65.2001L380.772 67.4001C382.772 62.7334 385.239 59.2668 388.172 57.0001C391.172 54.7334 394.739 53.6001 398.872 53.6001C404.539 53.6001 408.939 55.6001 412.072 59.6001C415.205 63.6001 416.772 69.1668 416.772 76.3001V105.1H401.972V78.9001C401.972 74.7668 401.039 71.6334 399.172 69.5001C397.372 67.3001 394.705 66.2001 391.172 66.2001C387.639 66.2001 384.939 67.3001 383.072 69.5001C381.205 71.6334 380.272 74.7668 380.272 78.9001V105.1H365.472V54.6001ZM456.304 106.4C450.904 106.4 446.037 105.267 441.704 103C437.437 100.667 434.071 97.5001 431.604 93.5001C429.204 89.5001 428.004 84.9668 428.004 79.9001C428.004 74.8334 429.204 70.3001 431.604 66.3001C434.071 62.2334 437.471 59.0668 441.804 56.8001C446.137 54.5334 451.004 53.4001 456.404 53.4001C461.871 53.4001 466.771 54.5668 471.104 56.9001C475.437 59.1668 478.804 62.3334 481.204 66.4001C483.604 70.4001 484.804 74.9334 484.804 80.0001C484.804 81.4668 484.704 82.9668 484.504 84.5001H442.404C443.071 87.7001 444.637 90.2668 447.104 92.2001C449.637 94.1334 452.704 95.1001 456.304 95.1001C458.971 95.1001 461.371 94.6001 463.504 93.6001C465.637 92.5334 467.371 91.0334 468.704 89.1001H483.404C481.404 94.4334 477.971 98.6668 473.104 101.8C468.304 104.867 462.704 106.4 456.304 106.4ZM470.604 75.4001C469.871 72.0668 468.237 69.4334 465.704 67.5001C463.171 65.5668 460.071 64.6001 456.404 64.6001C452.737 64.6001 449.637 65.6001 447.104 67.6001C444.637 69.5334 443.037 72.1334 442.304 75.4001H470.604Z"
        fill="url(#paint0_linear_title)"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_2160_100"
        x="0"
        y="0"
        width="519.804"
        height="145.4"
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
          result="effect1_dropShadow_2160_100"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_2160_100"
          result="shape"
        />
      </filter>
      <linearGradient
        id="paint0_linear_title"
        x1="418.485"
        y1="16.6001"
        x2="387.173"
        y2="208.568"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="rgb(var(--brand-cream))" />
        <stop offset="1" stopColor="rgb(var(--brand-lime))" />
      </linearGradient>
    </defs>
  </svg>
);

// Exact Figma source for the 179x179 Clover Icon
const CloverIcon: React.FC<{ className?: string; showGlow?: boolean }> = ({
  className,
  showGlow = false,
}) => {
  // Unique gradient ids per instance — duplicate ids break paint refs when the
  // first definition sits in a display:none subtree (desktop block on mobile).
  const uid = React.useId().replace(/:/g, "");
  const g0 = `clover0-${uid}`, g1 = `clover1-${uid}`, g2 = `clover2-${uid}`, g3 = `clover3-${uid}`, gc = `cloverGlow-${uid}`;
  return (
  <svg
    className={className || "w-[120px] h-[120px] md:w-[179px] md:h-[179px]"}
    viewBox="0 0 179 179"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id={g0} x1="99.3326" y1="3.02025" x2="172.825" y2="82.8891" gradientUnits="userSpaceOnUse">
        <stop stopColor="rgb(var(--brand-emerald))" />
        <stop offset="1" stopColor="rgb(var(--brand-lime-bright))" />
      </linearGradient>
      <linearGradient id={g1} x1="99.3326" y1="175.51" x2="172.825" y2="95.6412" gradientUnits="userSpaceOnUse">
        <stop stopColor="rgb(var(--brand-lime-bright))" />
        <stop offset="1" stopColor="rgb(var(--brand-emerald))" />
      </linearGradient>
      <linearGradient id={g2} x1="79.1976" y1="3.02025" x2="5.70492" y2="82.8891" gradientUnits="userSpaceOnUse">
        <stop stopColor="rgb(var(--brand-lime-bright))" />
        <stop offset="1" stopColor="rgb(var(--brand-emerald))" />
      </linearGradient>
      <linearGradient id={g3} x1="79.1976" y1="175.51" x2="5.70492" y2="95.6412" gradientUnits="userSpaceOnUse">
        <stop stopColor="rgb(var(--brand-emerald))" />
        <stop offset="1" stopColor="rgb(var(--brand-lime-bright))" />
      </linearGradient>
      <radialGradient id={gc} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="rgb(var(--brand-cream))" stopOpacity="0.9" />
        <stop offset="100%" stopColor="rgb(var(--brand-lime))" stopOpacity="0" />
      </radialGradient>
    </defs>

    <path d="M112.085 0C99.4818 0 89.2651 10.2167 89.2651 22.8197V66.4455C89.2651 79.0484 99.4818 89.2651 112.085 89.2651H155.711C168.314 89.2651 178.53 79.0484 178.53 66.4455C178.53 53.8425 168.314 43.6258 155.711 43.6258H134.904V22.8197C134.904 10.2167 124.688 0 112.085 0Z" fill={`url(#${g0})`} fillOpacity="0.44" />
    <path d="M112.085 178.53C99.4818 178.53 89.2651 168.314 89.2651 155.711V112.085C89.2651 99.4819 99.4818 89.2651 112.085 89.2651H155.711C168.314 89.2651 178.53 99.4819 178.53 112.085C178.53 124.688 168.314 134.904 155.711 134.904H134.904V155.711C134.904 168.314 124.688 178.53 112.085 178.53Z" fill={`url(#${g1})`} />
    <path d="M66.4455 0C79.0484 0 89.2651 10.2167 89.2651 22.8197V66.4455C89.2651 79.0484 79.0484 89.2651 66.4455 89.2651H22.8197C10.2167 89.2651 7.62939e-06 79.0484 7.62939e-06 66.4455C7.62939e-06 53.8425 10.2167 43.6258 22.8197 43.6258H43.6258V22.8197C43.6258 10.2167 53.8425 0 66.4455 0Z" fill={`url(#${g2})`} />
    <path d="M66.4455 178.53C79.0484 178.53 89.2651 168.314 89.2651 155.711V112.085C89.2651 99.4819 79.0484 89.2651 66.4455 89.2651H22.8197C10.2167 89.2651 7.62939e-06 99.4819 7.62939e-06 112.085C7.62939e-06 124.688 10.2167 134.904 22.8197 134.904H43.6258V155.711C43.6258 168.314 53.8425 178.53 66.4455 178.53Z" fill={`url(#${g3})`} />

    {showGlow && <circle cx="89.5" cy="89.5" r="32" fill={`url(#${gc})`} />}
  </svg>
  );
};

interface MilestoneNodeProps {
  id: string;
  date: string;
  title: React.ReactNode;
  details?: string[];
  rotateLabelDeg: number;
  showGlow?: boolean;
}

const MilestoneNode: React.FC<MilestoneNodeProps> = ({ id, date, title, details, rotateLabelDeg, showGlow }) => {
  const arcPath = `M 15 120 A 105 105 0 0 1 225 120`;

  return (
    // Fixed glitch by removing scale animation from the main bounding wrapper container
    <div className="relative flex flex-col items-center transform-gpu">
      {/* Interactive scale only applied to small nodes rather than overlapping layout layers */}
      <div className="relative z-10 transition-transform duration-150 active:scale-95 group cursor-default">

        <CloverIcon showGlow={showGlow} className="w-[120px] h-[120px] md:w-[179px] md:h-[179px] transition-transform duration-300 group-hover:scale-105" />

        {/* Arching Golden Date Text SVG Layer */}
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-visible drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          style={{
            width: "240px",
            height: "240px",
            transform: `translate(-50%, -50%) rotate(${rotateLabelDeg}deg)`,
          }}
          viewBox="0 0 240 240"
        >
          <defs>
            <path id={`arc-${id}`} d={arcPath} />
            <linearGradient id={`goldGradientText-${id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="4.89%" stopColor="rgb(var(--brand-cream))" />
              <stop offset="97.74%" stopColor="rgb(var(--brand-lime))" />
            </linearGradient>
          </defs>
          <text
            style={{
              fontFamily: "var(--font-oddval), sans-serif",
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}
            fill={`url(#goldGradientText-${id})`}
          >
            <textPath href={`#arc-${id}`} startOffset="50%" textAnchor="middle">
              {date}
            </textPath>
          </text>
        </svg>
      </div>

      <div className="absolute top-[105%] flex flex-col items-center whitespace-nowrap mt-2 z-20">
        <h4
          className="text-center text-transparent bg-clip-text"
          style={{
            fontFamily: "var(--font-oddval), sans-serif",
            fontSize: "clamp(26px, 3vw, 36px)",
            lineHeight: "110%",
            fontWeight: 600,
            background: "linear-gradient(214.92deg, rgb(var(--brand-cream)) 4.89%, rgb(var(--brand-lime)) 97.74%)",
            WebkitBackgroundClip: "text",
            textShadow: "0px 4px 20px rgba(5, 79, 0, 0.6)",
          }}
        >
          {title}
        </h4>

        {details && (
          <div className="flex items-stretch gap-4 mt-3 text-left w-full pl-2">
            <div className="w-[5px] bg-gradient-to-b from-brand-cream to-brand-lime rounded-full flex-shrink-0" />
            <div
              className="flex flex-col justify-between text-white text-[18px] md:text-[20px] font-semibold leading-[1.2] drop-shadow-md"
              style={{ fontFamily: "'SF Pro', ui-sans-serif, sans-serif" }}
            >
              {details.map((detail, idx) => (
                <span key={idx}>{detail}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function TimelineSection() {
  return (
    // Fixed: Added transform-gpu and backface-hidden class hint to section root container to prevent browser flickering artifacts
    <section className="relative w-full pt-4 pb-12 md:pt-8 md:pb-20 px-4 md:px-8 max-w-[1440px] mx-auto min-h-[700px] flex flex-col bg-transparent overflow-visible transform-gpu backface-hidden">

      {/* ======================================================= */}
      {/* DESKTOP LAYOUT                                            */}
      {/* ======================================================= */}
      <div className="relative hidden md:block w-full max-w-[1412px] aspect-[1412/966] mx-auto mt-4 transform-gpu">

        {/* Timeline Title positioned perfectly absolute */}
        <div className="absolute z-20 w-[380px] lg:w-[450px] xl:w-[520px]" style={{ left: "4%", top: "14%" }}>
          <TimelineTitle className="w-full h-auto" />
        </div>

        {/* Exact Figma Vector Path rendering */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg
            viewBox="0 0 1412 966"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="ribbonGrad" x1="988.83" y1="308.82" x2="866.84" y2="888.566" gradientUnits="userSpaceOnUse">
                <stop stopColor="rgb(var(--brand-cream))" />
                <stop offset="1" stopColor="rgb(var(--brand-lime))" />
              </linearGradient>
              <linearGradient id="blurGrad" x1="500.314" y1="435.576" x2="1031.09" y2="1030.39" gradientUnits="userSpaceOnUse">
                <stop stopColor="rgb(var(--brand-lime))" />
                <stop offset="0.557692" stopColor="rgb(var(--brand-teal))" />
                <stop offset="0.928728" stopColor="rgb(var(--brand-green))" />
              </linearGradient>
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* The exact green ambient background shape */}
            <path
              d="M32.369 200L-179.617 508.217C0.705827 607.735 136.542 547.629 183.973 529.815C254.87 503.188 597.976 700.498 621.942 765.291L464.433 407.361L32.369 200Z"
              fill="url(#blurGrad)"
              className="blur-[100px] opacity-80"
            />

            {/* The exact winding ribbon shape */}
            <path
              d="M-24 331.86C-6.91685 355.414 4.91677 381.992 12.5764 409.08C19.5641 433.319 23.4529 458.44 28.654 483.739C36.0051 520.455 47.5893 570.554 91.2197 591.494C131.976 611.332 174.084 610.229 214.37 608.827C294.893 604.145 372.084 588.449 450.132 571.581C492.023 562.396 531.079 554.715 571.059 549.573C592.269 546.924 611.082 545.266 630.126 545.702C638.797 545.94 648.231 546.884 654.551 548.829C656.148 549.313 657.358 549.798 658.237 550.227C659.347 550.754 659.855 551.165 659.936 551.286C660.052 551.439 659.61 551.172 659.162 550.565C658.713 549.995 658.331 549.091 658.223 548.708C658.319 547.065 657.082 554.734 652.892 561.873C649.098 568.945 643.598 577.1 637.923 584.885C626.339 600.814 613.014 616.829 600.035 634.777C593.415 644.103 587.025 653.194 580.967 665.829C578.226 671.797 575.038 679.279 573.835 689.52C572.211 699.32 575.632 716.864 585.767 726.715C606.49 745.578 621.902 743.441 634.231 745.199C647.766 745.937 657.698 745.395 670.444 744.296C844.216 727.261 1011.66 686.924 1178.02 642.963C1206.22 635.354 1234.31 627.572 1262.4 619.324C1272.83 616.23 1281.52 609.129 1286.52 599.471C1291.52 589.82 1292.43 578.403 1289.08 567.843C1285.73 557.284 1278.4 548.479 1268.75 543.479C1259.09 538.473 1247.9 537.681 1237.6 541.164C1237.6 541.164 1237.6 541.164 1237.6 541.164C1211.3 549.975 1183.47 558.801 1156.14 567.266C994.271 616.553 829.571 662.236 664.079 684.447C653.525 685.729 645.497 686.379 637.077 686.212C633.735 686.178 629.299 685.71 627.444 685.297C627.192 685.246 626.966 685.198 626.764 685.152C626.499 685.089 626.279 685.031 626.104 684.984C625.754 684.889 625.583 684.834 625.579 684.857C625.582 684.887 625.704 684.964 626.048 685.223C626.42 685.502 626.992 685.977 627.608 686.656C628.828 687.926 630.229 690.391 630.665 692.309C631.152 694.306 630.947 695.169 630.91 695.235C630.726 695.297 631.398 692.238 632.706 689.253C635.522 682.602 640.329 674.675 645.758 666.522C656.534 650.359 669.37 633.721 681.693 615.464C692.498 595.77 711.354 581.785 708.38 538.843C703.914 514.043 678.745 502.864 667.666 500.604C653.737 497.129 641.467 496.836 630.509 496.87C606.971 497.216 586.913 499.935 564.354 503.52C522.17 510.549 482.667 519.956 440.364 530.824C364.063 550.326 288.333 568.568 212.103 575.906C174.246 578.995 134.862 580.034 103.895 566.041C72.5065 552.919 60.9095 516.298 51.8322 478.423C45.6847 453.605 37.9248 427.655 26.4174 403.797C13.6836 377.003 -3.76383 352.64 -24 331.86Z"
              fill="url(#ribbonGrad)"
              filter="url(#neonGlow)"
            />
          </svg>
        </div>

        {/* Milestone 1 */}
        <div
          className="absolute"
          style={{ left: "17.37%", top: "63.99%", transform: "translate(-50%, -50%)" }}
        >
          <MilestoneNode
            id="milestone-1"
            date="13 July - 14 August"
            title={
              <>
                Open Registration
                <br />& Preliminary
              </>
            }
            rotateLabelDeg={-12}
            showGlow={false}
          />
        </div>

        {/* Milestone 2 */}
        <div
          className="absolute"
          style={{ left: "53.20%", top: "72.58%", transform: "translate(-50%, -50%)" }}
        >
          <MilestoneNode
            id="milestone-2"
            date="25 Agustus - 8 September"
            title="Semifinal"
            rotateLabelDeg={25}
            showGlow={false}
          />
        </div>

        {/* Milestone 3 */}
        <div
          className="absolute"
          style={{ left: "88.47%", top: "59.85%", transform: "translate(-50%, -50%)" }}
        >
          <MilestoneNode
            id="milestone-3"
            date="3 October"
            title="Main Event"
            details={[
              "Final Presentation",
              "Booth Exhibition",
              "Main Conference",
              "Awarding",
            ]}
            rotateLabelDeg={-5}
            showGlow={true}
          />
        </div>
      </div>

      {/* ======================================================= */}
      {/* MOBILE LAYOUT — custom serpentine neon "vine" ribbon     */}
      {/* ======================================================= */}
      <div className="relative md:hidden w-full pb-6 transform-gpu">
        <div className="w-full pl-4 mb-1 z-20 flex justify-start">
          <TimelineTitle className="w-[72%] max-w-[320px] h-auto" />
        </div>

        {/* Aspect-locked stage: ribbon SVG + nodes share one coordinate space (340 x 1040) */}
        <div className="relative w-full max-w-[360px] mx-auto aspect-[340/1040]">

          {(() => {
            // single source of truth for the winding path (rendered as 4 stacked strokes)
            const pathD =
              "M170 14 C 180 80 86 116 102 180 C 118 262 250 372 232 490 C 216 604 138 676 150 800 C 158 892 170 948 170 1010";
            return (
          <svg
            viewBox="0 0 340 1040"
            className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="ribbonGradM" x1="170" y1="0" x2="170" y2="1040" gradientUnits="userSpaceOnUse">
                <stop stopColor="rgb(var(--brand-cream))" />
                <stop offset="0.5" stopColor="rgb(var(--brand-lime-bright))" />
                <stop offset="1" stopColor="rgb(var(--brand-cream))" />
              </linearGradient>
              <linearGradient id="ambientGradM" x1="0" y1="150" x2="340" y2="860" gradientUnits="userSpaceOnUse">
                <stop stopColor="rgb(var(--brand-lime))" />
                <stop offset="0.55" stopColor="rgb(var(--brand-teal))" />
                <stop offset="1" stopColor="rgb(var(--brand-green))" />
              </linearGradient>
              <filter id="neonGlowM" x="-40%" y="-10%" width="180%" height="120%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Soft ambient green wash hugging the path */}
            <path d={pathD} fill="none" stroke="url(#ambientGradM)" strokeWidth="40" strokeLinecap="round" className="blur-[22px] opacity-50" />
            {/* Main glowing ribbon body */}
            <path d={pathD} fill="none" stroke="url(#ribbonGradM)" strokeWidth="13" strokeLinecap="round" filter="url(#neonGlowM)" />
            {/* Glossy inner highlight */}
            <path d={pathD} fill="none" stroke="rgb(var(--brand-cream))" strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />
            {/* Travelling dashed stitch */}
            <path d={pathD} fill="none" stroke="rgb(var(--brand-teal))" strokeWidth="1.6" strokeDasharray="2 13" strokeLinecap="round" opacity="0.6" />

            {/* Decorative sparkles along the vine */}
            {[
              { x: 258, y: 130, s: 0.9 },
              { x: 78, y: 320, s: 0.7 },
              { x: 268, y: 545, s: 0.8 },
              { x: 82, y: 700, s: 0.9 },
              { x: 250, y: 905, s: 0.7 },
            ].map((sp, i) => (
              <path
                key={i}
                d="M0 -12 C 1.3 -3.4 3.4 -1.3 12 0 C 3.4 1.3 1.3 3.4 0 12 C -1.3 3.4 -3.4 1.3 -12 0 C -3.4 -1.3 -1.3 -3.4 0 -12 Z"
                transform={`translate(${sp.x} ${sp.y}) scale(${sp.s})`}
                fill="rgb(var(--brand-cream))"
                opacity="0.85"
                style={{ filter: "drop-shadow(0 0 5px rgb(var(--brand-lime)))" }}
              />
            ))}
          </svg>
            );
          })()}

          {/* Decorative small clover leaves growing off the vine */}
          <div className="absolute z-[1]" style={{ left: "80%", top: "27%", transform: "translate(-50%,-50%) rotate(20deg)" }}>
            <CloverIcon className="w-[34px] h-[34px] opacity-25" />
          </div>
          <div className="absolute z-[1]" style={{ left: "18%", top: "62%", transform: "translate(-50%,-50%) rotate(-25deg)" }}>
            <CloverIcon className="w-[30px] h-[30px] opacity-20" />
          </div>

          {/* Milestone nodes pinned to the ribbon's bends */}
          {[
            { left: "30%", top: "17.3%", date: "13 July - 14 August", title: (<>Open Registration<br />& Preliminary</>), glow: false, details: undefined as string[] | undefined },
            { left: "68.2%", top: "47.1%", date: "25 Agustus - 8 September", title: "Semifinal", glow: false, details: undefined },
            { left: "44.1%", top: "76.9%", date: "3 October", title: "Main Event", glow: true, details: ["Final Presentation", "Booth Exhibition", "Main Conference", "Awarding"] },
          ].map((item, idx) => (
            <div
              key={idx}
              className="absolute z-10"
              style={{ left: item.left, top: item.top, transform: "translate(-50%, -50%)" }}
            >
              <MilestoneNode
                id={`mobile-milestone-${idx}`}
                date={item.date}
                title={item.title}
                details={item.details}
                rotateLabelDeg={0}
                showGlow={item.glow}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}