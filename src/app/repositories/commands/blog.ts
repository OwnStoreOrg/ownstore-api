export interface IBlogInfoUpdateCommand {
  id: number | null
  title: string
  description: string
  url: string
  imageId: number | null
  position: number
  isActive: boolean
}
