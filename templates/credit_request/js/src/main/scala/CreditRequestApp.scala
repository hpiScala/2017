import com.sap.marmolata.utils.validation.withFuture.StdValidators
import com.sap.marmolata.app.MarmolataClient
import com.sap.marmolata.app.client.MarmolataShell
import com.sap.marmolata.ui._
import com.sap.marmolata.ui.dataImplicits._
import com.sap.marmolata.ui.extensions.implicitExtensions._
import com.sap.marmolata.ui.layout._
import com.sap.marmolata.utils.validation.{Result, Success}

import reactive.library._

import scala.concurrent.Future
import scala.language.existentials
import scala.concurrent.ExecutionContext.Implicits.global

@MarmolataClient(CreditRequestApi)
object CreditRequestApp extends MarmolataShell {

  import reactive.library.unsafeImplicits._
  import com.sap.marmolata.utils.builder.StaticBuilder

  val intField = Input[Int]()
    .initialValue("0")
    .validator(
      StdValidators.ltEq(1000000)
    ).build


  val strField = Input[String]()
    .initialValue("xxxxxx")
    .validator(
      StdValidators.longerThan(5)
    )
    .build

  def toBool(s: Signal[Option[Result[_]]]): Signal[Boolean] = s.map(_ match {
     case Some(Success(v)) => true
     case _ => false
    })

  val button = Button()
    .text("PressMe")
    .enabled(
      (toBool(intField.validatedValue) |@| toBool(strField.validatedValue)).map(
        {case (a,b) => a && b}
      )
    ).build

  val formContainer =
    FormContainer().elements(
      Seq(
        FormElement().label("IntField").fields(intField),
        FormElement().label("StrField").fields(strField)
      )
    )

  val tblRowProvider: Var[RowProvider[Credit.Offer]] = Var(EmptyRowProvider)

  val table = Table[Credit.Offer]()
    .columns(
      Column()
        .heading("SomeColumn")
        .representation[Credit.Offer, String](row => s"${"%.2f".format(row.dbl)} - ${row.str}")
        .build()
    )
    .selectionMode(SelectionMode.None)
    .content(tblRowProvider)

  val page1 =
    Page().title("Credit request")
      .content(
        Form().title(FormTitle()
          .text("FormTitle")
        ).containers(
          formContainer
        )  above
          button.asBuilder
      ).build()



  val page2 =
    Page().title("Credit offer list")
      .showNavButton(true)
      .content(table)
      .build()

  val pageTransitions: EventSource[PageTransition] = EventSource()

  button.clicks.observe(_ => {
    pageTransitions := PageTransition(StaticBuilder(page2))
    callService()
  })

  page2.navButtonPress.observe(_ => {
    pageTransitions := PageTransition(StaticBuilder(page1), PageTransitionEffect.SlideRight)
  })

  def callService(): Unit = {
    val result: Future[Seq[Credit.Offer]] = Server.getQuotes().call
    val resRowProvider: Future[RowProvider[Credit.Offer]] = result.map(rows => {
      StaticRowProvider(rows)
    })
    resRowProvider.foreach(rowProvider => {tblRowProvider := rowProvider})
  }

  val render = App().initialPage(page1).pageTransitions(pageTransitions).build()
}
