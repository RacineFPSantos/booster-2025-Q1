import { IsEnum } from 'class-validator';
import { StatusPedidoEnum } from '../../../shared/enums/database.enums';

export class UpdatePedidoStatusDto {
  @IsEnum(StatusPedidoEnum)
  status: StatusPedidoEnum;
}
