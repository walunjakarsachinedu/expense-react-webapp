import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { signupSchema } from "../utils/form-validation-schema";

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function useSignupValidation() {
  const {
    trigger,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = async (field: keyof SignupFormValues) => {
    if (!touched[field]) {
      markTouched(field);
      await trigger(field);
    }
  };

  const markTouched = (fieldName: keyof SignupFormValues) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  const markAllTouched = () => {
    markTouched("name");
    markTouched("email");
    markTouched("password");
    markTouched("confirmPassword");
  };

  const onChange = async (field: keyof SignupFormValues, value: string) => {
    setValue(field, value);
    if (touched[field]) await trigger(field);
  };

  return {
    getValues,
    trigger,
    errors,
    touched,
    handleBlur,
    onChange,
    markAllTouched,
  };
}

export default useSignupValidation;
