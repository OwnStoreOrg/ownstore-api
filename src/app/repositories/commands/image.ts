export interface IImageInfoUpdateCommand {
  id: number | null
  name: string
  url: string
  meta: {
    thirdPartyId: string | null
    originalName: string | null
    sizeInBytes: string | null
    width: number | null
    height: number | null
  } | null
}
