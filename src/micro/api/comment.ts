import axios, { AxiosResponse } from 'axios'
import type { CommentPayload, CommentResponse, ResourceType } from './types'

interface IAICommentPayload {
  comment: string
  teamInCharge: string
  userReceptor: number[]
  module: string
  resource: number
}

interface SimpleCommentPayload {
  comments: string
}

interface EditCommentPayload {
  idResource: string
  resourceType: ResourceType
  comment: string
}

export class CommentAPI {
  private static readonly baseUrl = 'https://gates.alegra.com/api/v1'
  private static readonly aiAnalyzerUrl =
    'https://almost-notifications-generator-api.alegra.com/api/v1/analyzer-comments'
  private static readonly resourceTypeMap: Record<string, string> = {
    invoice: 'invoices',
    estimate: 'estimates',
    debitNote: 'debit-notes',
    creditNote: 'credit-notes',
    receipt: 'receipts',
    remission: 'remissions',
    purchaseOrder: 'purchase-orders',
    bill: 'bills',
    payment: 'payments',
  }

  private static getResourceEndpoint(resourceType: ResourceType, resourceId: string): string {
    if (!resourceId) {
      throw new Error('Resource ID is required')
    }

    const pluralType = this.resourceTypeMap[resourceType] || `${resourceType}s`
    return `${this.baseUrl}/${pluralType}/${resourceId}/comments`
  }

  /**
   * Creates a new comment associated with a resource
   * @param payload Comment creation payload
   * @returns Promise with the created comment
   */
  public static async createComment(
    payload: CommentPayload
  ): Promise<AxiosResponse<CommentResponse>> {
    const endpoint = this.getResourceEndpoint(payload.resourceType, payload.idResource)
    const simplePayload: SimpleCommentPayload = {
      comments: payload.comment,
    }
    return axios.post(endpoint, simplePayload)
  }

  /**
   * Updates an existing comment
   * @param commentId ID of the comment to update
   * @param payload Comment update payload
   * @returns Promise with the updated comment
   */
  public static async updateComment(
    commentId: number,
    payload: CommentPayload
  ): Promise<AxiosResponse<CommentResponse>> {
    const editPayload: EditCommentPayload = {
      idResource: payload.idResource,
      resourceType: payload.resourceType,
      comment: payload.comment,
    }
    return axios.put(`${this.baseUrl}/comments/${commentId}`, editPayload)
  }

  /**
   * Deletes a comment (logical deletion)
   * @param commentId ID of the comment to delete
   * @param payload Comment deletion payload
   * @returns Promise with the deleted comment
   */
  public static async deleteComment(
    commentId: number,
    payload: CommentPayload
  ): Promise<AxiosResponse<CommentResponse>> {
    const endpoint = this.getResourceEndpoint(payload.resourceType, payload.idResource)
    return axios.delete(`${endpoint}/${commentId}`)
  }

  /**
   * Process a comment through AI analysis
   * @param payload AI analysis payload
   */
  public static async processAIComment(payload: IAICommentPayload): Promise<AxiosResponse<any>> {
    return axios.post(this.aiAnalyzerUrl, payload)
  }
}
