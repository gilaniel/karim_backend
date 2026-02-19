import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    create(createUserDto: CreateUserDto): Promise<User>;
    update(id: string, updateData: Partial<CreateUserDto>): Promise<User>;
    remove(id: string): Promise<void>;
}
