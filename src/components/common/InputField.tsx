import { InputText } from "primereact/inputtext";
import { ChangeEventHandler } from "react";

type FieldProps = {
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  type?: string | undefined;
  id: string;
};
function InputField({ label, value, onChange, type, id }: FieldProps) {
  return (
    <>
      <br />
      <div className="flex flex-column gap-2 w-full">
        <label htmlFor={id}>{label}</label>
        <InputText
          id={id}
          type={type}
          className="w-full"
          value={value}
          onChange={onChange}
        />
      </div>
    </>
  );
}

export default InputField;
