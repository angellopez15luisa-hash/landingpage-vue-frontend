import type {
  generalSettingSchema,
  generalSettingResponseSchema,
} from '@/schemas/general-setting.schema'
import z from 'zod'

// 1. Tipo base inferido del esquema general
export type GeneralSetting = z.infer<typeof generalSettingSchema>

 
// 4. Tipo para la respuesta del servidor
export type GeneralSettingDataResponse = z.infer<
  typeof generalSettingResponseSchema
>
