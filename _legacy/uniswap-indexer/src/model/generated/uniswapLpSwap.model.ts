import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_} from "typeorm"
import * as marshal from "./marshal"
import {UniswapLPToken} from "./uniswapLpToken.model"
import {UniswapLPSwapMethod} from "./_uniswapLpSwapMethod"

@Entity_()
export class UniswapLPSwap {
  constructor(props?: Partial<UniswapLPSwap>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @Column_("text", {nullable: false})
  account!: string

  @Column_("text", {nullable: false})
  contract!: string

  /**
   * tokenAddress:tokenAddress
   */
  @Index_()
  @Column_("text", {nullable: false})
  pair!: string

  @Index_()
  @Column_("text", {nullable: false})
  pairSymbol!: string

  @Column_("text", {nullable: true})
  intermediatePath!: string | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  deadline!: bigint

  @Index_()
  @ManyToOne_(() => UniswapLPToken, {nullable: false})
  token0!: UniswapLPToken

  @Index_()
  @ManyToOne_(() => UniswapLPToken, {nullable: false})
  token1!: UniswapLPToken

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  token0Amount!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  token1Amount!: bigint

  @Column_("varchar", {length: 24, nullable: false})
  method!: UniswapLPSwapMethod

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  gas!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  blockNumber!: bigint

  @Column_("timestamp with time zone", {nullable: false})
  timestamp!: Date
}
