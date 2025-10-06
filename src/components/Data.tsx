function DataPrice1() {
  const inputStyle =
    "w-full px-4 py-3 bg-transparent border-2 border-white rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff6969] focus:border-transparent transition duration-200";

  return (
    <div className="p-6 md:p-8 rounded-xl shadow-2xl text-white">
      <div className="mb-6">
        <label htmlFor="nomeCasal" className="sr-only">
          Nome do casal
        </label>

        <input
          className={inputStyle}
          type="text"
          id="nomeCasal"
          placeholder="Nome do casal"
        />
      </div>
      <div className="mb-6 flex flex-col md:flex-row md:space-x-4">
        <div className="flex-1 mb-4 md:mb-0">
          <label htmlFor="inicioRelacionamento" className="sr-only">
            Início do relacionamento
          </label>

          <input
            className={`${inputStyle} appearance-none`}
            type="date"
            id="inicioRelacionamento"
            placeholder="Início do relacionamento"
          />
        </div>

        <div className="flex-1">
          <label htmlFor="horaMinuto" className="sr-only">
            Hora e minuto (opcional)
          </label>

          <input
            className={inputStyle}
            type="time"
            id="horaMinuto"
            placeholder="Hora e minuto (opcional)"
          />
        </div>
      </div>
      <div className="mb-6">
        <label htmlFor="email" className="sr-only">
          Seu e-mail
        </label>
        <input
          className={inputStyle}
          type="email"
          id="email"
          placeholder="Seu e-mail"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="mensagem" className="sr-only">
          Declare seu amor em uma mensagem especial.
        </label>
        <textarea
          className={`${inputStyle} resize-none h-32`}
          id="mensagem"
          rows={4}
          placeholder="Declare seu amor em uma mensagem especial."
        ></textarea>
      </div>
      <div className="mb-6 space-y-4">
        <label htmlFor="fileInput" className="cursor-pointer block">
          <div className="h-16 w-full bg-[#996fcc] text-white font-bold flex items-center justify-center p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6969] hover:bg-opacity-90 transition-colors duration-200 shadow-lg">
            Adicione até 3 imagens
          </div>
        </label>

        <input
          id="fileInput"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
        />
        <button className="bg-[#ff6969] rounded-lg w-full h-16 font-bold text-white hover:bg-[#e05656] transition duration-200 shadow-lg">
          <h1>Crie sua Pagina Agora!</h1>
        </button>
      </div>
    </div>
  );
}

export default DataPrice1;
