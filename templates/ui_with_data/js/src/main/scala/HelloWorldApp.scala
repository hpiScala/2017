import com.sap.marmolata.app.MarmolataClient
import com.sap.marmolata.app.client.MarmolataFrontend
import com.sap.marmolata.ui.{App, Label, Page}
import com.sap.marmolata.ui.implicits._


@MarmolataClient
object HelloWorldApp extends MarmolataFrontend {
  val label = Label("Hello World!").build
  val label2 = Label("Hello Marmolata!").build
  val render = App().initialPage(Page().content(label above label2)).build()
}
