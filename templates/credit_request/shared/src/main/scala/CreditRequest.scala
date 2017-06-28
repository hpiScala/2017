import boopickle.DefaultBasic._

object Credit {
  case class Offer(str: String, dbl: Double)
  implicit val pickler: Pickler[Offer] = PicklerGenerator.generatePickler[Offer]
}

trait CreditRequestApi  {
  def getQuotes(): Seq[Credit.Offer]
}


trait CreditRequestApiImpl extends CreditRequestApi {
  val rnd = scala.util.Random

  override def getQuotes(): Seq[Credit.Offer] = { 
    Seq.fill(rnd.nextInt(5) + 1)(Credit.Offer(rnd.alphanumeric.take(6).mkString, rnd.nextFloat))
  }
}




