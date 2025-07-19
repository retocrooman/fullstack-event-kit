import { Controller, Get, Param, Put, Body } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, UserResponseDto } from './dto/user.dto';
import { UserService } from './services/user.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  // NOTE: User creation should be done via auth server (port 4000)
  // This API server handles profile management for authenticated users only

  @Get(':id')
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

  // TODO: Add JWT-protected endpoints
  // @Get('me')
  // @UseGuards(AuthGuard)
  // async getCurrentUser(@Request() req): Promise<UserResponseDto> {
  //   return this.userService.getUserById(req.user.id);
  // }

  // @Put('me')  
  // @UseGuards(AuthGuard)
  // async updateCurrentUser(@Request() req, @Body() updateUserDto: Partial<CreateUserDto>): Promise<UserResponseDto> {
  //   return this.userService.updateUser(req.user.id, updateUserDto);
  // }

}
