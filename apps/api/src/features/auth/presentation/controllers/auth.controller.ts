import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";

import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { Request, Response } from "express";

import { AppConfigService } from "@core/config/app-config.service.js";
import { ExceptionFormat } from "@core/exceptions/filters/exceptions.filter.js";
import { Public } from "@core/session/decorators/is-public.decorator.js";
import { SessionGuard } from "@core/session/guards/session.guard.js";
import { AuthService } from "@features/auth/application/auth.service.js";
import { LoginDto } from "../dtos/login.dto.js";
import { AuthenticatedUserPresenter } from "../presenters/authenticated-user.presenter.js";

@Controller("auth")
@ApiTags("Auth")
@UseGuards(SessionGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: AppConfigService
  ) {}

  @Post("login")
  @HttpCode(200)
  @Public()
  @ApiOkResponse({ type: AuthenticatedUserPresenter })
  @ApiUnauthorizedResponse({
    description: "El email o la contraseña son incorrectos",
    type: ExceptionFormat,
  })
  @ApiForbiddenResponse({
    description: "El usuario no está activo",
    type: ExceptionFormat,
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request
  ): Promise<AuthenticatedUserPresenter> {
    const { email, password } = loginDto;
    const user = await this.authService.validateCredentials(email, password);

    // Regenera el ID de sesión para prevenir session fixation (CWE-384)
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((error) => (error ? reject(error) : resolve()));
    });

    req.session.userId = user.id;

    await new Promise<void>((resolve, reject) => {
      req.session.save((error) => (error ? reject(error) : resolve()));
    });

    return AuthenticatedUserPresenter.fromDomain(user);
  }

  @Post("logout")
  @HttpCode(204)
  @ApiNoContentResponse({ description: "Sesión cerrada correctamente" })
  @ApiUnauthorizedResponse({
    description: "No hay una sesión activa",
    type: ExceptionFormat,
  })
  async logout(@Req() req: Request, @Res() res: Response) {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((error) => (error ? reject(error) : resolve()));
    });

    res.clearCookie(this.config.get("sessionCookieName"));
    res.status(204).end();
  }

  @Get("me")
  @HttpCode(200)
  @ApiOkResponse({ type: AuthenticatedUserPresenter })
  @ApiUnauthorizedResponse({
    description: "No hay una sesión activa o el usuario ya no existe",
    type: ExceptionFormat,
  })
  async me(@Req() req: Request): Promise<AuthenticatedUserPresenter> {
    const user = await this.authService.getCurrentUser(req.session.userId!);
    return AuthenticatedUserPresenter.fromDomain(user);
  }
}
