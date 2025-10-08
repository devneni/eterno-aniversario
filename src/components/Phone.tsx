interface PropsPhone {
  coupleName: string;
  relationshipTime: string;
}

function Phone({ coupleName, relationshipTime }: PropsPhone) {
  return (
    <div className="border-12 p-4 w-[300px] rounded-[45px] mt-50 border-[#484d52] h-150">
      <p className="text-[#ff6969] text-[20px] text-center font-bold">
        {coupleName}
      </p>

      <p className="text-white text-center mt-2 font-semibold">
        Estão juntos há
      </p>
      {relationshipTime && (
        <p className="text-white text-center text-lg font-bold">
          {relationshipTime}
        </p>
      )}
    </div>
  );
}

export default Phone;
