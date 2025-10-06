interface PropsPhone {
  name: string;
  email: string;
}

function Phone({ name, email }: PropsPhone) {
  return (
    <div className="border-12  p-4 w-[300px] rounded-[45px]  border-[#484d52] h-150">
      <span className="text-white ">Ariel sam</span>
    </div>
  );
}

export default Phone;
