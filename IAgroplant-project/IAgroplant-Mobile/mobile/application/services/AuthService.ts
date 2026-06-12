import { post } from "../../infrastructure/api/api";

export async function login(
  email: string,
  password: string
) {
  return await post(
    "/auth/login",
    {
      email,
      password,
    }
  );
}