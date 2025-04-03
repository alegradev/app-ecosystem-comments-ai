export interface IContact {
  id: number
  name: string
  identification: string
  phonePrimary: string
  phoneSecondary: string
  mobile: string
  email: string
  status: string
  type: string[]
  address: IAddress
  term: ITerm
  seller: any //actualizar typado
  priceList: any //actualizar typado
  statementAttached: boolean
  fax: any //actualizar typado
  observations: any //actualizar typado
  accounting: IAccounting
  accountingReceivablePeriodsClosed: boolean
  accountingDebtToPayPeriodsClosed: boolean
  created_at: Date
  updated_at: Date
  branchOffices: any[] //actualizar typado
  attachmentsTotal: number
  fiscalId: any //actualizar typado
  thirdType: string
  thirdsType?: string
  internalContacts: IInternalContact[]
  cfdiUse: string
  paymentType: string
  paymentMethod: string
  operationType: string
  regime: string
  settings: ISettings
  regimeObject: string[]
  ivaCondition: string
  creditLimit: number | null
  identificationObject: { dv: string; identification: string }
  exoneration?: IContactExoneration
}

export interface IContactExoneration {
  percentage: number
  documentType: string
  emissionDate: string
  documentNumber: string
  institutionName: string
  dueDate: string
}

export interface IInternalContact {
  id: number
  idLocal: number
  name: string
  lastName: string
  email: string
  phone: string
  mobile: string
  sendNotifications: boolean
}

export interface IAccounting {
  accountReceivable: any //actualizar typado
  debtToPay: any //actualizar typado
}

export interface IAddress {
  street: string
  exteriorNumber: string
  interiorNumber: string
  colony: string
  locality: string
  municipality: string
  zipCode: string
  state: string
  country: string
}

export interface ISettings {
  sendElectronicDocuments: boolean
}

export interface ITerm {
  id: number
  name: string
  days: string
  idGlobal: string
}
