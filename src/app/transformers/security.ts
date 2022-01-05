import { ISecurityQuestionInfo } from '../contract/security'
import SecurityQuestion from '../models/SecurityQuestionModel'

export const prepareSecurityQuestionInfo = (securityQuestion: SecurityQuestion): ISecurityQuestionInfo => {
  return {
    id: securityQuestion.id,
    question: securityQuestion.question,
  }
}
