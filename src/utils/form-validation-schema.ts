import * as yup from "yup";

const emailValidation = yup
  .string()
  .required("Email is required")
  .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email");

export const loginSchema = yup.object({
  email: emailValidation,
  password: yup.string().required("Password is required"),
});

const passwordValidation = yup
  .string()
  .required("Password is required")
  .min(8, "Must be at least 8 characters")
  .matches(/[a-z]/, "Must include a lowercase letter")
  .matches(/[A-Z]/, "Must include an uppercase letter")
  .matches(/\d/, "Must include a number")
  .matches(/[@$!%*?&]/, "Must include a special character");

const confirmPasswordValidation = yup
  .string()
  .required("Confirm Password is required")
  .test("required-if-password", "Passwords must match", function (value) {
    return this.parent.password == value;
  });

export const signupSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .required("Email is required")
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email"),
  password: passwordValidation,
  confirmPassword: confirmPasswordValidation,
});

export const changePasswordSchema = yup.object({
  password: passwordValidation,
  confirmPassword: confirmPasswordValidation,
});

export const sendResetCodeSchema = yup.object({ email: emailValidation });

export const verifyResetCodeSchema = yup.object({
  resetCode: yup.string().required("Reset code is required"),
});
