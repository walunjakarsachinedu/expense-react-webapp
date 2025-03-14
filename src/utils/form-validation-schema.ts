import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup.string().required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const signupSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Must be at least 8 characters")
    .matches(/[a-z]/, "Must include a lowercase letter")
    .matches(/[A-Z]/, "Must include an uppercase letter")
    .matches(/\d/, "Must include a number")
    .matches(/[@$!%*?&]/, "Must include a special character"),
  confirmPassword: yup
    .string()
    .required("Confirm Password is required")
    .test("required-if-password", "Passwords must match", function (value) {
      return this.parent.password == value;
    }),
});
