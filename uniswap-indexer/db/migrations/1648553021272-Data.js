module.exports = class Data1648553021272 {
  name = 'Data1648553021272'

  async up(db) {
    await db.query(`CREATE TABLE "uniswap_lp_token" ("id" character varying NOT NULL, CONSTRAINT "PK_b81441af399f7087cfb94f58df0" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "uniswap_lp_swap" ("id" character varying NOT NULL, "account" text NOT NULL, "pair" text NOT NULL, "intermediate_path" text, "deadline" numeric NOT NULL, "token0_amount" numeric NOT NULL, "token1_amount" numeric NOT NULL, "gas" numeric NOT NULL, "block_number" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "transaction_hash" text NOT NULL, "token0_id" character varying NOT NULL, "token1_id" character varying NOT NULL, CONSTRAINT "PK_aa9cb83825d2e7d5785370c1436" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_cd44f11dd0fd8f8d1b4eb9209d" ON "uniswap_lp_swap" ("account") `)
    await db.query(`CREATE INDEX "IDX_4597c111daf45097516f00504f" ON "uniswap_lp_swap" ("pair") `)
    await db.query(`CREATE INDEX "IDX_53ee97c20acf035007d63695dc" ON "uniswap_lp_swap" ("token0_id") `)
    await db.query(`CREATE INDEX "IDX_0fd533b022abd05b6e35ca1805" ON "uniswap_lp_swap" ("token1_id") `)
    await db.query(`ALTER TABLE "uniswap_lp_swap" ADD CONSTRAINT "FK_53ee97c20acf035007d63695dcf" FOREIGN KEY ("token0_id") REFERENCES "uniswap_lp_token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "uniswap_lp_swap" ADD CONSTRAINT "FK_0fd533b022abd05b6e35ca1805e" FOREIGN KEY ("token1_id") REFERENCES "uniswap_lp_token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  async down(db) {
    await db.query(`DROP TABLE "uniswap_lp_token"`)
    await db.query(`DROP TABLE "uniswap_lp_swap"`)
    await db.query(`DROP INDEX "public"."IDX_cd44f11dd0fd8f8d1b4eb9209d"`)
    await db.query(`DROP INDEX "public"."IDX_4597c111daf45097516f00504f"`)
    await db.query(`DROP INDEX "public"."IDX_53ee97c20acf035007d63695dc"`)
    await db.query(`DROP INDEX "public"."IDX_0fd533b022abd05b6e35ca1805"`)
    await db.query(`ALTER TABLE "uniswap_lp_swap" DROP CONSTRAINT "FK_53ee97c20acf035007d63695dcf"`)
    await db.query(`ALTER TABLE "uniswap_lp_swap" DROP CONSTRAINT "FK_0fd533b022abd05b6e35ca1805e"`)
  }
}
