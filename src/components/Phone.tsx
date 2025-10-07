interface PropsPhone {
  name: string;
  email: string;
}

function Phone({ couplename, email }: PropsPhone) {
  return (
    <div className="border-12  p-4 w-[300px] rounded-[45px]  mt-50 border-[#484d52] h-150">
      <span className="text-white ">{couplename}</span>
    </div>
  );
}

export default Phone;
