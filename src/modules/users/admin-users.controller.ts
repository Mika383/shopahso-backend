import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AppRole } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateUserDto } from './create-user.dto';
import { ResetUserPasswordDto } from './reset-user-password.dto';
import { UpdateUserRoleDto } from './update-user-role.dto';
import { UpdateUserStatusDto } from './update-user-status.dto';
import { UsersService } from './users.service';

@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(AppRole.ADMIN)
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneAdmin(id);
  }

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.usersService.createUser({
      fullName: body.fullName,
      dateOfBirth: body.dateOfBirth,
      email: body.email,
      phoneNumber: body.phoneNumber,
      password: body.password,
      role: body.role,
    });
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() body: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, body.role);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateUserStatusDto) {
    return this.usersService.updateStatus(id, body.active);
  }

  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body() body: ResetUserPasswordDto) {
    return this.usersService.resetPassword(id, body.password);
  }
}
