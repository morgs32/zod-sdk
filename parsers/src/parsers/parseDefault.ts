import z from 'zod'
import { ParserSelector } from '../types'

export const parseDefault: ParserSelector = () => {
  return z.any()
}
