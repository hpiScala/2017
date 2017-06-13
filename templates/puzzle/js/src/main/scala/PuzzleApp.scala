import com.sap.marmolata.app.MarmolataClient
import com.sap.marmolata.app.client.MarmolataFrontend
import com.sap.marmolata.ui.{Label, Page, App, Button}
import com.sap.marmolata.ui.implicits._
import com.sap.marmolata.ui.layout.Grid

import reactive.library._

import scala.collection._


@MarmolataClient
object PuzzleApp extends MarmolataFrontend {


  var xCell = 3
  var yCell = 3
  val cellsInEdge = 4
  val buttonTexts: mutable.Map[(Int, Int), Var[String]]=mutable.Map()

  // create a playing field
  // create buttons and declare on-click event handler
  val buttons = for {
    y <- 0 until cellsInEdge
  } yield for {
    x <- 0 until cellsInEdge
  } yield {
    val tmpVar: Var[String] = Var((y * cellsInEdge + x + 1).toString)
    println(s"x: $x, y: $y")
    buttonTexts += (x, y) -> tmpVar
    val btn = Button().text(tmpVar).build()
    btn.clicks.observe(_ => buttonHandler(x,y))
    btn
  }
  buttonTexts(xCell, yCell) := ""

  //implement event handler
  def buttonHandler(x: Int, y: Int): Unit = {
    if (Math.abs(x - xCell) > 1 || Math.abs(y - yCell) > 1)
      return

    (x, y) match {
      case (x, y) if (x != xCell) && (y == yCell) => {
        horizontalShift(x, y, xCell)
        xCell = x
        yCell = y
      }

      case (x, y) if (x == xCell) && (y != yCell) => {
        verticalShift(x, y, yCell)
        xCell = x
        yCell = y
      }

      case _ => ()
    }

    def horizontalShift(x: Int, y: Int, xEmpty: Int): Unit = {

      (x, xEmpty) match {
        case (x1, x2) if x1 == x2 => buttonTexts(x, y) := ""
        case (x1, x2) => {
          val offset = if (x1 > x2) 1 else -1
          buttonTexts(x2, y) := buttonTexts(x2 + offset, y).now
          horizontalShift(x1, y, x2 + offset)
        }
      }
    }

    def verticalShift(x: Int, y: Int, yEmpty: Int): Unit = {

      (y, yEmpty) match {
        case (y1, y2) if y1 == y2 => buttonTexts(x, y) := ""
        case (y1, y2) => {
          val offset = if (y1 > y2) 1 else -1
          buttonTexts(x, y2) := buttonTexts(x, y2 + offset).now
          verticalShift(x, y1, y2 + offset)
        }
      }
    }
  }

  //add button to shuffle buttons (1-15 + empty) on the playing field
  val btnMix = Button().text("Shuffle").build()
  btnMix.clicks.observe( _ => shuffle())

  //implement shuffling
  def shuffle(): Unit = {
    val rl = util.Random.shuffle((0 until cellsInEdge * cellsInEdge).toList)
    xCell = rl.head / cellsInEdge
    yCell = rl.head % cellsInEdge
    buttonTexts(xCell, yCell) := ""
    for ((pos, label) <- rl.tail.view.zipWithIndex)
      buttonTexts(pos / cellsInEdge, pos % cellsInEdge) := (label + 1).toString
  }

  //render
  val render = App().initialPage(
        Page().content(
         Label(text = "Puzzle")
         above Grid().defaultSpan(12/cellsInEdge).content(buttons.flatten.map(_.asBuilder))
         above btnMix
        )
      ).build
}
