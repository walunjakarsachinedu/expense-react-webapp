import { Password } from "primereact/password";
import { ChangeEventHandler, forwardRef } from "react";

type FieldProps = {
  label: string;
  defaultValue: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onPressEnter?: () => void;
  onBlur?: () => void;
  errorMsg?: string;
  touched?: boolean;
  id: string;
};
const PasswordField = forwardRef<Password | null, FieldProps>(
  (fieldProps: FieldProps, ref) => {
    const { label, defaultValue } = fieldProps;
    const { onChange, onPressEnter, onBlur } = fieldProps;
    const { touched, errorMsg, id } = fieldProps;

    return (
      <>
        <br />
        <div className="flex flex-column gap-2 w-full">
          <label htmlFor={id}>{label}</label>
          <Password
            ref={ref}
            id={id}
            onKeyDown={(e) => {
              if (e.key == "Enter") onPressEnter?.();
            }}
            inputClassName="w-full"
            defaultValue={defaultValue}
            onChange={onChange}
            onBlur={onBlur}
            feedback={false}
            toggleMask
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

export default PasswordField;
