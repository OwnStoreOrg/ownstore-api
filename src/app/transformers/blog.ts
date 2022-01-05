import Blog from '../models/BlogModel'
import { IBlogInfo } from '../contract/blog'
import { prepareSEOKeywords, generateSlug } from '../utils/common'
import { prepareImageInfo } from './image'

export const prepareBlogInfo = (blog: Blog): IBlogInfo => {
  return {
    id: blog.id,
    slug: generateSlug(blog.title),
    title: blog.title,
    description: blog.description,
    url: blog.url,
    image: blog.image ? prepareImageInfo(blog.image) : null,
    position: blog.position,
    isActive: blog.isActive,
    createdDateTime: new Date(blog.createdAt),
  }
}
