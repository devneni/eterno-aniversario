function Price1() {
  return (
    <button className="flex-1 h-full">
      {" "}
      <div className="bg-white rounded-lg p-4 flex flex-col justify-between h-full shadow-md w-30  items-stretch">
        <p>1 ano</p> <p>3 fotos</p>
        <p>Sem música</p>{" "}
        <p className="text-[#ff6969]">
          de<span className="line-through"> R$14,90</span>{" "}
        </p>{" "}
        <p className="text-[#ff6969]">
          por <span className="font-bold text-2xl"> R$9,90</span>{" "}
        </p>{" "}
      </div>{" "}
    </button>
  );
}

export default Price1;
