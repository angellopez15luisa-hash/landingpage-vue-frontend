import { ReviewOpinionService } from "../services/review-opinion.service";

export class ReviewOpinionAction {

  static getAll = () => ReviewOpinionService.getAll()
}
