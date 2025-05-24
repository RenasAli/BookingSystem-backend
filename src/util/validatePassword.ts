function validatePassword(password: string): void {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!regex.test(password)) {
    throw new Error(
      "Password must be at least 8 characters long and include uppercase, lowercase, and a number."
    );
  }
}

export default validatePassword;