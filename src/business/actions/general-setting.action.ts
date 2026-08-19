import { GeneralSettingService } from "../services/general-setting.service";


export class GeneralSettingAction {

  static get = () => GeneralSettingService.get()


}
