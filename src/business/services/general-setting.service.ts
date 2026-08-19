import { generalSettingDataResponseSchema } from '@/schemas/general-setting.schema'
import { GeneralSettingApi } from '../apis/general-setting.api'
import { isAxiosError } from 'axios'
import type { GeneralSetting } from '@/types/general-setting.type'

export class GeneralSettingService {
  static get = async (): Promise<GeneralSetting> => {
    try {
      const { data } = await GeneralSettingApi.get()
      const response = generalSettingDataResponseSchema.safeParse(data)
      if (!response.success)
        throw new Error('La respuesta del servidor no tiene el formato esperado')
      return response.data.generalSetting
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }
}
