function Price2() {
  return (
    <button className="flex-1 h-full">
      <div className="bg-white rounded-lg p-4 flex flex-col justify-between w-30 h-full shadow-md">
        <p>1 ano</p>

        <p>7 fotos</p>

        <p>com música</p>

        <p className="text-[#ff6969] ">
          de <span className="line-through">R$21,90</span>
        </p>

        <p className="text-[#ff6969]">
          por
          <span className="font-bold text-2xl"> R$16,90</span>
        </p>
      </div>
    </button>
  );
}

export default Price2;
