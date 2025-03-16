import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { loginSchema } from "../utils/form-validation-schema";

interface LoginFormValues {
  email: string;
  password: string;
}

function useLoginValidation() {
  const {
    trigger,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = async (field: keyof LoginFormValues) => {
    if (!touched[field]) {
      setTouched((prev) => ({ ...prev, [field]: true }));
      await trigger(field);
    }
  };

  const markTouched = (fieldName: keyof LoginFormValues) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  const markAllTouched = () => {
    markTouched("email");
    markTouched("password");
  };

  const onChange = async (field: keyof LoginFormValues, value: string) => {
    setValue(field, value);
    if (touched[field]) await trigger(field);
  };

  return {
    getValues,
    trigger,
    markAllTouched,
    errors,
    touched,
    handleBlur,
    onChange,
  };
}

export default useLoginValidation;
