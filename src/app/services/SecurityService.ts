import { inject, injectable } from 'inversify'
import BaseService from './BaseService'
import { ICartService, ISecurityService, IUserService, IWishlistService } from './interface'
import {
  IUserUpdateSecurityPasswordHintInfoParams,
  IUserUpdateSecurityPasswordHintInfo,
  IUserSecurityQuestionsDetail,
  IUserSecurityQuestionAnswer,
  IUserUpdateSecurityQuestionAnswerParams,
  IUserUpdateSecurityQuestionAnswer,
  IUserSecurityPasswordHintInfo,
  IUserVerifySecurityQuestionAnswerParams,
  IUserVerifySecurityQuestionAnswer,
} from '../contract/security'
import bcrypt from 'bcrypt'
import AppError from '../errors/AppError'
import { isEmptyObject } from '../utils/common'
import { EntityNotFoundError } from '../errors/EntityError'
import {
  IISecurityQuestionInfoDelete,
  IISecurityQuestionInfoUpdate,
  IISecurityQuestionInfoUpdateParams,
  ISecurityAnswerInfo,
  ISecurityQuestionInfo,
} from '../contract/security'
import { CacheBuild, CacheBulkBuild, CachePurge } from '../decorators/cache'
import { SERVICE_CACHE_TTL } from '../constants'
import { prepareSecurityQuestionInfo } from '../transformers/security'
import { IFindParams } from '../contract/common'

@injectable()
export default class SecurityService extends BaseService implements ISecurityService {
  @CacheBuild('US', [[0]], SERVICE_CACHE_TTL.DEFAULT, 'SPHI')
  public async getUserPasswordHintInfo(userId: number): Promise<IUserSecurityPasswordHintInfo> {
    const hint = await this.getUserPasswordHintRepository().getHintByUserId(userId)

    return {
      hint: hint,
    }
  }

  @CachePurge('US', [[0]], 'SPHI')
  public async updateUserPasswordHintInfo(
    userId: number,
    params: IUserUpdateSecurityPasswordHintInfoParams
  ): Promise<IUserUpdateSecurityPasswordHintInfo> {
    const result: IUserUpdateSecurityPasswordHintInfo = {
      success: false,
      message: null,
    }

    const users = await this.getUserRepository().getBulk([userId])

    if (isEmptyObject(users)) {
      throw new EntityNotFoundError('User', userId)
    }

    const { password: dbPassword } = users[userId]

    const passwordMatched = bcrypt.compareSync(params.password, dbPassword)

    if (!passwordMatched) {
      result.message = 'Incorrect password!'
      throw new AppError(401, result.message, 'INCORRECT_PASSWORD', result)
    } else {
      await this.getUserPasswordHintRepository().updateUserPasswordHint(userId, {
        hint: params.hint,
      })

      result.message = 'Password hint updated'
      result.success = true
    }

    return result
  }

  @CacheBulkBuild('US', [[0]], SERVICE_CACHE_TTL.LONG, 'SQIS')
  private async _prepareSecurityQuestionState(questionIds: number[]): Promise<Record<number, ISecurityQuestionInfo>> {
    const result: Record<number, ISecurityQuestionInfo> = {}

    const securityQuestionMap = await this.getSecurityQuestionRepository().getBulk(questionIds)

    Object.entries(securityQuestionMap).forEach(([questionId, question]) => {
      result[questionId] = prepareSecurityQuestionInfo(question)
    })

    return result
  }

  @CacheBuild('US', [], SERVICE_CACHE_TTL.LONG, 'SQIL')
  public async getAllSecurityQuestions(findParams: IFindParams): Promise<ISecurityQuestionInfo[]> {
    const questionIds = await this.getSecurityQuestionRepository().getBulkIds(findParams)
    const questionInfos = await this._prepareSecurityQuestionState(questionIds)
    return Object.values(questionInfos)
  }

  public async getSecurityQuestion(questionId: number): Promise<ISecurityQuestionInfo> {
    const questionInfos = await this._prepareSecurityQuestionState([questionId])

    const questionInfo = questionInfos[questionId]

    if (!questionInfo) {
      throw new EntityNotFoundError('SecurityQuestion', questionId)
    }

    return questionInfo
  }

  public async updateSecurityQuestion(
    questionId: number | null,
    params: IISecurityQuestionInfoUpdateParams
  ): Promise<IISecurityQuestionInfoUpdate> {
    const result: IISecurityQuestionInfoUpdate = {
      success: false,
    }

    if (questionId) {
      await this.getSecurityQuestionRepository().updateSecurityQuestion({
        id: questionId,
        ...params,
      })
      result.success = true
    } else {
      await this.getSecurityQuestionRepository().addSecurityQuestion({
        id: null,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteSecurityQuestion(questionId: number): Promise<IISecurityQuestionInfoDelete> {
    const result: IISecurityQuestionInfoDelete = {
      success: false,
    }

    await this.getSecurityQuestionRepository().deleteSecurityQuestion(questionId)
    result.success = true

    return result
  }

  @CacheBuild('US', [[0]], SERVICE_CACHE_TTL.LONG, 'SQAL')
  public async getUserSecurityQuestionAnswers(userId: number): Promise<IUserSecurityQuestionAnswer[]> {
    const answers = await this.getUserSecurityQuestionAnswerRepository().getBlukByUserId(userId)
    return answers.map(answer => ({
      id: answer.id,
      question: {
        id: answer.securityQuestion.id,
        question: answer.securityQuestion.question,
      },
    }))
  }

  @CachePurge('US', [[0]], 'SQAL')
  public async updateUserSecurityQuestionAnswers(
    userId: number,
    params: IUserUpdateSecurityQuestionAnswerParams
  ): Promise<IUserUpdateSecurityQuestionAnswer> {
    const result: IUserUpdateSecurityQuestionAnswer = {
      success: false,
      message: null,
    }

    const users = await this.getUserRepository().getBulk([userId])

    if (isEmptyObject(users)) {
      throw new EntityNotFoundError('User', userId)
    }

    const { password: dbPassword } = users[userId]

    const passwordMatched = bcrypt.compareSync(params.password, dbPassword)

    if (!passwordMatched) {
      result.message = 'Incorrect password!'
      throw new AppError(401, result.message, 'INCORRECT_PASSWORD', result)
    } else {
      await this.getUserSecurityQuestionAnswerRepository().updateSecurityAnswers(userId, params)

      result.success = true
      result.message = 'Security questions updated'
    }

    return result
  }

  public async areSecurityAnswersValid(userId: number, answers: ISecurityAnswerInfo[]): Promise<boolean> {
    const userAnswers = await this.getUserSecurityQuestionAnswerRepository().getBlukByUserId(userId)

    const verificationMap: Record<number, boolean> = {}

    answers.forEach(answer => {
      const isCorrectAnswer = userAnswers.some(
        dbAnswer => dbAnswer.securityQuestion.id === answer.questionId && dbAnswer.answer === answer.answer
      )
      verificationMap[answer.questionId] = isCorrectAnswer
    })

    const hasIncorrectAnswers = Object.values(verificationMap).some(k => !k)

    if (hasIncorrectAnswers) {
      throw new AppError(406, `Incorrect security answers`, 'INCORRECT_ANSWERS')
    }

    return true
  }

  public async verifyUserSecurityQuestionAnswers(
    params: IUserVerifySecurityQuestionAnswerParams
  ): Promise<IUserVerifySecurityQuestionAnswer> {
    const result: IUserVerifySecurityQuestionAnswer = {
      success: false,
    }

    const user = await this.getUserRepository().getUserByEmail(params.email)

    if (!user) {
      throw new AppError(404, 'Invalid email', 'INVALID_EMAIL')
    }

    const answersValid = await this.areSecurityAnswersValid(user.id, params.securityAnswers)

    result.success = answersValid

    return result
  }

  public async getUserSecurityQuestionsDetail(userId: number): Promise<IUserSecurityQuestionsDetail> {
    const [allQuestions, answers] = await Promise.all([
      this.getAllSecurityQuestions({}),
      this.getUserSecurityQuestionAnswers(userId),
    ])

    return {
      allQuestions: allQuestions,
      answeredQuestions: answers,
    }
  }
}
