import com.sap.marmolata.secureddata.dsl._

object DisplayLineItemsAuthSemantics {
  val grantStatements = AuthSemanticsParser(
    """ grant select on BSEG
        grant select on ACDOCA
        grant select on T001
        grant select on SKAT
        grant select on FINSC_LEDGER_REP
        grant select on FINSC_LEDGER_T
        grant select on FINSC_LD_CMP
        grant select on TKA01
        grant select on KNA1
        grant select on LFA1
        grant select on FAGL_SEGMT
        grant select on TFKBT
        grant select on TGSBT
        grant select on T003T
        grant select on CEPC
        grant select on CEPCT
        grant select on FISV_LAMA
        grant select on DD07T
    """)
}

trait DefaultAuthorization extends AuthorizationMapping {
  override def authorizationSemantics: Seq[GrantOn] = DisplayLineItemsAuthSemantics.grantStatements
}
