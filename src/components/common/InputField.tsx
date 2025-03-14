import { InputText } from "primereact/inputtext";
import { ChangeEventHandler, forwardRef } from "react";

type FieldProps = {
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onPressEnter?: () => void;
  onBlur?: () => void;
  type?: string | undefined;
  errorMsg?: string;
  touched?: boolean;
  id: string;
};
const InputField = forwardRef<HTMLInputElement | null, FieldProps>(
  (
    {
      label,
      value,
      onChange,
      onPressEnter,
      onBlur,
      touched,
      type,
      errorMsg,
      id,
    }: FieldProps,
    ref
  ) => {
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
            defaultValue={value}
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
