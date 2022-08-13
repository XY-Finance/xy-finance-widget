export type ChainIdNumber =
  | '1'
  | '5'
  | '56'
  | '97'
  | '137'
  | '80001'
  | '250'
  | '4002'
  | '25'
  | '338'
  | '108'
  | '18'
  | '43114'
  | '43113'
  | '322'
  | '321'
  | '42161'
  | '421611'
  | '10'
  | '69'
  | '81'
  | '592'
  | '1287'
  | '1285'
  | '1001'
  | '8217'
  | '1819'
  | '1818'

export type Orientation = 'portrait' | 'landscape'

export interface Config {
  fromTokenAddress: string
  sourceChainId: ChainIdNumber
  toTokenAddress: string
  targetChainId: ChainIdNumber
  amount?: number
  slippage?: string
  orientation?: Orientation
}