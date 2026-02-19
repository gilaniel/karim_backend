export class CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  age?: number;
  isActive?: boolean;
}
