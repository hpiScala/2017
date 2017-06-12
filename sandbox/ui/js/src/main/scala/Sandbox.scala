
import com.sap.marmolata.ui._
import com.sap.marmolata.ui.layout._

import scala.scalajs.js
import reactive.library._
import com.sap.marmolata.utils.builder.BuilderForProduct

// suggestion providers
import com.sap.marmolata.ui.suggestions._

// validators (with Future) used on input controls
import com.sap.marmolata.utils.validation.withFuture.{Validator, StdValidators}

// type converter (with Future) used on (some) input controls
import com.sap.marmolata.utils.converter.withFuture.TypeConverter

// collection of essential implicits (type class evidence, extension classes for builders, validators, ...)
import com.sap.marmolata.ui.implicits._

// the implicit execution context to be used
import scala.concurrent.ExecutionContext.Implicits.global

// use for logging instead of `println`
import org.scalajs.dom.console

// imported to allow for time span notation in the form '500 milliseconds'
import scala.concurrent.duration._
import scala.language.postfixOps

object Sandbox extends js.JSApp {

  def main(): Unit = {

    val suggestionProvider = TabularSuggestionProvider.static(
      Seq(
        RowSuggestion()
          .value("Hans")
          .representation(Seq(
            Text().text("Hans").build(),
            Text().text("26").build()))
          .keywords(Set("Hans"))
          .build,
        RowSuggestion()
          .value("Julia")
          .representation(Seq(
            Text().text("Julia").build(),
            Text().text("23.5").build()))
          .keywords(Set("Julia", "Julika"))
          .build),
      Seq("Name", "Age")
    )

    val input = Input().suggestionProvider(suggestionProvider)

    render(input)
  }

  def render(builder: BuilderForProduct[Control]): Unit = {
    builder.build.renderAt(org.scalajs.dom.document.body)
  }
}
