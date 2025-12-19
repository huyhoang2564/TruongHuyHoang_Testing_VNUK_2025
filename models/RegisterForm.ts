import type { User } from './User';

export class RegisterForm {
  constructor(
    public email: string,
    public password: string,
    public confirmPassword: string,
    public pid: string
  ) {}

  toUser(): User {
    return {
      email: this.email,
      password: this.password
    };
  }
}
