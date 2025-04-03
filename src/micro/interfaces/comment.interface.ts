import type { CommentStatus, ResourceType } from '../api/types'
import { IContact } from './contact.interface'

export interface IComment {
  id: number
  idLocal: number
  idCompany: number
  idUser: string
  idResource: string
  resourceType: ResourceType
  comment: string
  status: CommentStatus
  userName?: string
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
  currentComment?: string
}

export interface ICommentsProps {
  action: 'view' | 'edit' | 'create' | 'clone'
  resourceId: string | number
  resourceType: ResourceType
  postUrl: string
  comments: IComment[]
  commentConfig?: {
    resourceType: ResourceType
    postUrl: string
  }
  docInfo?: {
    id: string | number
    date: string
    dueDate: string
    deliveryDate: string
    datetime: string
    client: Record<string, any>
    provider: Record<string, any>
    anotation: string
    observations: string
    decimalPrecision: string
    priceList: { id: number; name: string }
    seller: { id: number; name: string }
    comments: IComment[]
    status: string
    total: number
    user: {
      id: string
      username: string
      name: string
      lastName: string
      email: string
      phone: string
      role: string
      status: string
      language: string
      position: string
    }
    warehouse: { id: number; name: string }
    url: string[]
    attachments: any[]
    number: string
    stamp: any
  }
  onAddComment?: {
    success: () => void
    error: (error: string) => void
  }
  onEditComment?: {
    success: () => void
    error: (error: string) => void
  }
}

export interface ICommentConfig {
  resourceType: 'remission' | 'estimate' | 'debitNote' | 'purchaseOrder' | 'invoice'
  postUrl: string
}

export interface IDocInfo {
  id: number | string
  date: string
  dueDate: string
  deliveryDate: string
  datetime: string
  client: Partial<IContact>
  provider: Partial<IContact>
  anotation: string
  observations: string
  decimalPrecision: string
  priceList: IDocPriceList
  seller: IDocSeller
  comments: IComment[]
  status: string
  total: number
  user: IUser
  warehouse: IDocWarehouse
  url: IAttachFile[]
  attachments: IAttachFile[]

  number: string

  equivalenceSurchargeApplied?: boolean
  isImportedXML?: boolean
  calculationScale?: string
  calculationTotalMethod?: string
  stamp: any
}

export interface IDocPriceList {
  id: number
  name: string
}

export interface ICompany {
  identification: string
  email: string
}

export interface IDocPriceList {
  id: number
  name: string
}

export interface IDocWarehouse {
  id: number
  name: string
}

export interface IDocCostCenter {
  id: number
  name: string
}

export interface IDocSeller {
  id: number
  name: string
}

export interface IUser {
  id: string
  username: string
  name: string
  lastName: string
  email: string
  phone: string
  role: string
  status: string
  language: string
  position: string
  signature?: ISign
}

export interface ISign {
  id: number
  name: string
  url: string
}

export interface IAttachFile {
  id: number
  name: string
  url: string
}
