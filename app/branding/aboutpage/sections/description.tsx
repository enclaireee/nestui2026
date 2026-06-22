import Image from "next/image";

export function Description() {
  return (
    <section className="flex w-full flex-col items-center pt-10 pb-24 sm:pt-14 sm:pb-32">
      {/* Hero wordmark */}
      <Image
        src="/aboutheronest.webp"
        alt="NEST UI 2026"
        width={2769}
        height={576}
        priority
        className="h-auto w-full max-w-4xl"
      />

      {/* Intro description */}
      <p className="mt-6 max-w-4xl text-center text-base font-semibold leading-loose text-white sm:mt-8 sm:text-lg">
        National Electrical Summit (NEST) UI 2026 hadir sebagai wadah kolaborasi
        dan inovasi yang mempertemukan teknologi, kesehatan, dan generasi muda
        untuk membentuk masa depan healthcare yang lebih cerdas, inklusif, dan
        berkelanjutan. Dengan mengusung tema{" "}
        <span className="italic">
          &ldquo;Shaping the Future of Healthcare Through Intelligent and
          Inclusive Innovation,&rdquo;
        </span>{" "}
        NEST UI 2026 mendorong lahirnya solusi berdampak melalui integrasi
        berbagai disiplin ilmu dan pemanfaatan teknologi untuk menjawab tantangan
        kesehatan masyarakat masa kini maupun masa depan.
      </p>

      {/* Our Vision */}
      <div className="mt-24 flex w-full max-w-4xl flex-col items-center gap-4 sm:mt-32 sm:flex-row sm:gap-12">
        <Image
          src="/nestlogo.webp"
          alt="Nest UI logo"
          width={320}
          height={320}
          className="h-44 w-44 shrink-0 object-contain sm:h-60 sm:w-60"
        />
        <div className="flex flex-1 flex-col">
          <h2
            className="bg-clip-text text-center text-4xl font-bold tracking-wide text-transparent sm:text-left sm:text-5xl"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #FEFCE8 0%, #BEF264 100%)",
            }}
          >
            OUR VISION
          </h2>
          <p className="mt-5 text-justify text-base font-semibold leading-loose text-white sm:text-lg">
            Menjadi wadah kompetisi nasional yang mendorong lahirnya inovasi
            teknologi kesehatan yang inklusif, kolaboratif, dan berdampak melalui
            sinergi multidisiplin dalam menjawab tantangan masa depan.
          </p>
        </div>
      </div>
    </section>
  );
}
