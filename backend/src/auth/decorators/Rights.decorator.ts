import { SetMetadata } from '@nestjs/common';
import { RightsEnum } from '../../users/Models/Enums/rights.enum';

//Decorator for roles which should user have
/**
 * Which rights are requaried
 * @param roles jagged array (or operation for first array, and operation for second) or flat array with and operation
 */
export function Rights(rights: RightsEnum[][] | RightsEnum[]) {
  if (Array.isArray(rights[0])) return SetMetadata('rights', rights);

  return SetMetadata('rights', [rights]);
}
