import { ChangeEvent, useState } from "react";
import {
  FieldValues,
  Path,
  PathValue,
  useForm,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";

type CustomFormValidationConfig = {
  /** mark all field as touched & trigger form validation */
  validateForm: () => Promise<boolean>;
  /** returns all fields, use to make validation work for field with `fieldName`. */
  setupFieldValidation: (fieldName: string) => {
    defaultValue: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
    onBlur: () => Promise<void>;
    errorMsg: string;
    touched: boolean;
  };
};

export function useFormValidation<
  TFieldTypes extends Record<string, unknown>,
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined
>(
  props?: UseFormProps<TFieldValues, TContext>
): UseFormReturn<TFieldValues, TContext, TTransformedValues> &
  CustomFormValidationConfig {
  const formMethods = useForm<TFieldValues, TContext>(props);
  const { trigger, setValue, getValues } = formMethods;
  const {
    formState: { errors },
  } = formMethods;

  const [touched, setTouched] = useState<Record<keyof TFieldTypes, boolean>>(
    {} as Record<keyof TFieldTypes, boolean>
  );

  const markTouched = (fieldName: keyof TFieldTypes) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  const markAllTouched = () => {
    (
      Object.keys(props?.defaultValues ?? {}) as Array<keyof TFieldTypes>
    ).forEach(markTouched);
  };

  const handleBlur = async (field: keyof TFieldTypes) => {
    if (!touched[field]) {
      markTouched(field);
      await trigger(field as Path<TFieldValues>);
    }
  };

  const onChange = async (
    field: keyof TFieldTypes,
    value: PathValue<TFieldValues, Path<TFieldValues>>
  ) => {
    setValue(field as Path<TFieldValues>, value);
    if (touched[field]) {
      await trigger(field as Path<TFieldValues>);
    }
  };

  const setupFieldValidation = (fieldName: string) => {
    const model = getValues();
    return {
      defaultValue: model[fieldName],
      onChange: (e: ChangeEvent<HTMLInputElement>) =>
        onChange(
          fieldName,
          e.target.value as PathValue<TFieldValues, Path<TFieldValues>>
        ),
      onBlur: () => handleBlur(fieldName),
      errorMsg: errors[fieldName]?.message as string,
      touched: touched[fieldName],
    };
  };

  const validateForm = async () => {
    markAllTouched();
    return await trigger();
  };

  return {
    ...formMethods,
    validateForm,
    setupFieldValidation,
  };
}
