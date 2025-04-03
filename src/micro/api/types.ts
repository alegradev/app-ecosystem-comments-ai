export interface CommentPayload {
  idCompany: number
  idUser: string
  idResource: string
  resourceType: ResourceType
  comment: string
}

export interface CommentResponse {
  data: {
    id: number
    idLocal: number
    idCompany: number
    idUser: string
    idResource: string
    resourceType: ResourceType
    comment: string
    status: CommentStatus
  }
}

export type CommentStatus = 'active' | 'deleted'

export type ResourceType =
  | 'invoice'
  | 'estimate'
  | 'debitNote'
  | 'creditNote'
  | 'transaction'
  | 'transactionIn'
  | 'transactionOut'
  | 'bill'
  | 'purchaseOrder'
  | 'remission'
  | 'saleTicket'
  | 'client'
  | 'incomeDebitNote'
  | 'transportationReceipt'
