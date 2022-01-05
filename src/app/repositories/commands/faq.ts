export interface IFAQTopicInfoUpdateCommand {
  id: number | null
  name: string
  position: number
  isActive: boolean
}

export interface IFAQInfoUpdateCommand {
  id: number | null
  topicId: number
  question: string
  answer: string
  position: number
  isActive: boolean
}
