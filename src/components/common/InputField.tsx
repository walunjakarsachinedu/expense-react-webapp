import { InputText } from "primereact/inputtext";
import { ChangeEventHandler, forwardRef } from "react";

type FieldProps = {
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onPressEnter?: () => void;
  type?: string | undefined;
  id: string;
};
const InputField = forwardRef<HTMLInputElement | null, FieldProps>(
  ({ label, value, onChange, onPressEnter, type, id }: FieldProps, ref) => {
    return (
      <>
        <br />
        <div className="flex flex-column gap-2 w-full">
          <label htmlFor={id}>{label}</label>
          <InputText
            ref={ref}
            id={id}
            type={type}
            onKeyDown={(e) => {
              if (e.key == "Enter") onPressEnter?.();
            }}
            className="w-full"
            value={value}
            onChange={onChange}
          />
        </div>
      </>
    );
  }
);

export default InputField;
