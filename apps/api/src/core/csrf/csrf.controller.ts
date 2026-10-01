import { Controller, Get, Req, Res } from "@nestjs/common";

import type { Request, Response } from "express";

import { Public } from "@core/session/decorators/is-public.decorator.js";
import { CsrfService } from "./csrf.service.js";

@Controller("csrf")
export class CsrfController {
  constructor(private readonly csrfService: CsrfService) {}

  @Get("token")
  @Public()
  setCsrfToken(@Req() req: Request, @Res() res: Response) {
    // Se devuelve el csrfToken en el body para reenviarlo en el header x-csrf-token
    const csrfToken = this.csrfService.generateToken(req, res);
    res.status(200).json({ csrfToken });
  }
}
