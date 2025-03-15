import { InputText } from "primereact/inputtext";
import { ChangeEventHandler, forwardRef } from "react";

type FieldProps = {
  label: string;
  defaulValue: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onPressEnter?: () => void;
  onBlur?: () => void;
  type?: string | undefined;
  errorMsg?: string;
  touched?: boolean;
  id: string;
};
const InputField = forwardRef<HTMLInputElement | null, FieldProps>(
  (fieldProps: FieldProps, ref) => {
    const { label, defaulValue } = fieldProps;
    const { onChange, onPressEnter, onBlur } = fieldProps;
    const { touched, type, errorMsg, id } = fieldProps;
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
            defaultValue={defaulValue}
            onChange={onChange}
            onBlur={onBlur}
          />
        </div>
        {touched && errorMsg && (
          <div className="pt-2 pb-1 pr-1 text-sm text-red-200">
            ⚠ {errorMsg}
          </div>
        )}
      </>
    );
  }
);

export default InputField;
