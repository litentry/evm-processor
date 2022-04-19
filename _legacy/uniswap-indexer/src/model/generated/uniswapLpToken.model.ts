import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class UniswapLPToken {
  constructor(props?: Partial<UniswapLPToken>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: false})
  symbol!: string

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  decimals!: bigint | undefined | null

  @Column_("text", {nullable: false})
  name!: string
}
