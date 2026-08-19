import api from "@/lib/axios";
import type { GeneralSettingDataResponse } from "@/types/general-setting.type";

export class GeneralSettingApi {
  static get = () => api.get<GeneralSettingDataResponse>(`/general-settings/public`)
}
