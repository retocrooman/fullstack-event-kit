import { Controller, Get, Param, Put, Body } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { User, AuthUser } from '../auth/decorators/user.decorator';
import { CreateUserDto, UserResponseDto } from './dto/user.dto';
import { UserService } from './services/user.service';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    type: UserResponseDto,
  })
  async getCurrentUser(@User() authUser: AuthUser): Promise<UserResponseDto> {
    // Try to find existing user, create if not exists
    try {
      return await this.userService.getUserById(authUser.userId);
    } catch (error) {
      // If user doesn't exist, create from Auth0 data
      const createUserDto: CreateUserDto = {
        email: authUser.email,
        name: authUser.name,
        // age is optional and not provided by Auth0
      };
      return this.userService.createUserFromAuth0(authUser.userId, createUserDto);
    }
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserResponseDto,
  })
  async updateCurrentUser(@User() authUser: AuthUser, @Body() updateUserDto: Partial<CreateUserDto>): Promise<UserResponseDto> {
    return this.userService.updateUser(authUser.userId, updateUserDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User profile found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.getUserById(id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all users (admin functionality)' })
  @ApiResponse({
    status: 200,
    description: 'List of user profiles',
    type: [UserResponseDto],
  })
  async getAllUsers(): Promise<UserResponseDto[]> {
    return this.userService.getAllUsers();
  }

  @Put(':id')
  @Public()
  @ApiOperation({ summary: 'Update user profile by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>): Promise<UserResponseDto> {
    return this.userService.updateUser(id, updateUserDto);
  }

}
