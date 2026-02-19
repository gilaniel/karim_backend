import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    create(createUserDto: CreateUserDto): Promise<User>;
    update(id: string, updateData: Partial<CreateUserDto>): Promise<User>;
    remove(id: string): Promise<void>;
}
