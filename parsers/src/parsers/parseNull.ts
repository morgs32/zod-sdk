import z from 'zod';
import { ParserSelector } from '../types';

export const parseNull: ParserSelector<{ type: 'null' }> = () => {
  return z.null()
};
