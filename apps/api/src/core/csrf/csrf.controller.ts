import { Controller, Get, Req, Res } from "@nestjs/common";

import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";

import { Public } from "@core/session/decorators/is-public.decorator.js";
import { CsrfTokenPresenter } from "./csrf-token.presenter.js";
import { CsrfService } from "./csrf.service.js";

@Controller("csrf")
@ApiTags("Csrf")
export class CsrfController {
  constructor(private readonly csrfService: CsrfService) {}

  @Get("token")
  @Public()
  @ApiOkResponse({ type: CsrfTokenPresenter })
  setCsrfToken(@Req() req: Request, @Res() res: Response) {
    // Se devuelve el csrfToken en el body para reenviarlo en el header x-csrf-token
    const csrfToken = this.csrfService.generateToken(req, res);
    res.status(200).json(CsrfTokenPresenter.fromToken(csrfToken));
  }
}
