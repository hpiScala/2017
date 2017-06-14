import com.sap.marmolata.ui.{App, Label, Page}

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
object HelloWorldApp extends MarmolataShell {
  val label = Label("Hello World!").build
  val label2 = Label("Hello Marmolata!").build
  val render = App().initialPage(Page().content(label above label2)).build()
}
