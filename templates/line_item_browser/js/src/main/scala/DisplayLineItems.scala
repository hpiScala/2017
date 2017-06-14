

import com.sap.marmolata.ui.App

import scala.language.existentials

import com.sap.marmolata.app.MarmolataClient
import com.sap.marmolata.app.client.MarmolataShell
import com.sap.marmolata.data.query.untyped.ClientDataApi
import com.sap.marmolata.data.sql._
import com.sap.marmolata.data.types._
import com.sap.marmolata.erp._
import com.sap.marmolata.ui
import com.sap.marmolata.ui.{List => _, _}
import com.sap.marmolata.ui.layout.Vertical
import reactive.library._
import com.sap.marmolata.ui.dataImplicits._

import scala.concurrent.ExecutionContext.Implicits.global


@MarmolataClient(com.sap.marmolata.data.query.untyped.QueryExecAPI)
object DisplayLineItems extends MarmolataShell {

  val query = sql"select BUKRS, H_BUDAT, BELNR, HKONT, SHKZG, KOART from BSEG"
  val filter = FilterBar.datasource(query).build

  val table = Table.datasource(filter.output).selectionMode(SelectionMode.None).build

  val render = App().initialPage(Page().content(filter above table)).build
}
