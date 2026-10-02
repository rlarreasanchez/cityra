import { ApiProperty } from "@nestjs/swagger";

export class HealthPresenter {
  @ApiProperty({ example: "ok" })
  status: string;

  @ApiProperty({ example: "2026-10-01T12:00:00.000Z" })
  timestamp: string;

  @ApiProperty({ example: "cityra-api" })
  service: string;

  private constructor(data: HealthPresenter) {
    this.status = data.status;
    this.timestamp = data.timestamp;
    this.service = data.service;
  }

  static fromDomain(data: {
    status: string;
    timestamp: string;
    service: string;
  }): HealthPresenter {
    return new HealthPresenter(data);
  }
}
