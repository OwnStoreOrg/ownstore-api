export interface ICatalogueInfoUpdateCommand {
  id: number | null
  name: string
  imageIds: string
  position: number
  isActive: boolean
}
