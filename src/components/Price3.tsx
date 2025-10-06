function Price3() {
  return (
    <button className="flex-1 h-full relative flex flex-col items-center">
      <div
        className="

        absolute

        top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2

        text-1xl items-stretch px-4 py-1

        bg-black text-white

        rounded-lg border-2 border-[#fed640]

        shadow-[0_0_20px_#fed640] whitespace-nowrap z-10

      "
      >
        Escolha Preferida!
      </div>

      <div
        className="

        mt-8 p-4 h-full

        flex flex-col justify-between items-center

        bg-white rounded-xl shadow-lg border border-gray-300

        text-center

      "
      >
        <p className="text-xl font-normal text-black">Eterno</p>

        <p className="text-lg text-black">12 fotos</p>
        <p className="text-lg text-black">Com música</p>

        <div className="mt-4">
          <p className="text-sm text-red-400">
            de <span className="line-through">R$ 36,90</span>
          </p>

          <p className="text-[#ff6969] text-sm mt-1">por</p>

          <p className="text-[#ff6969] text-3xl font-bold">R$24,90</p>
        </div>
      </div>
    </button>
  );
}

export default Price3;
