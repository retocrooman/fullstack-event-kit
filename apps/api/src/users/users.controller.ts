import { Controller, Get, Param, Put, Body } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { 
  type CreateUserInput, 
  type UpdateUserInput, 
  type UserResponse 
} from '@repo/shared-schemas';
import { Public } from '../auth/decorators/public.decorator';
import { User, AuthUser } from '../auth/decorators/user.decorator';
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
  })
  async getCurrentUser(@User() authUser: AuthUser): Promise<UserResponse> {
    // Try to find existing user, create if not exists
    try {
      return await this.userService.getUserById(authUser.userId);
    } catch (error) {
      // If user doesn't exist, create from Auth0 data
      const createUserData: CreateUserInput = {
        email: authUser.email,
        name: authUser.name,
        // age is optional and not provided by Auth0
      };
      return this.userService.createUserFromAuth0(authUser.userId, createUserData);
    }
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  async updateCurrentUser(@User() authUser: AuthUser, @Body() updateUserData: UpdateUserInput): Promise<UserResponse> {
    return this.userService.updateUser(authUser.userId, updateUserData);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User profile found',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<UserResponse> {
    return this.userService.getUserById(id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all users (admin functionality)' })
  @ApiResponse({
    status: 200,
    description: 'List of user profiles',
  })
  async getAllUsers(): Promise<UserResponse[]> {
    return this.userService.getAllUsers();
  }

  @Put(':id')
  @Public()
  @ApiOperation({ summary: 'Update user profile by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async updateUser(@Param('id') id: string, @Body() updateUserData: UpdateUserInput): Promise<UserResponse> {
    return this.userService.updateUser(id, updateUserData);
  }

}
