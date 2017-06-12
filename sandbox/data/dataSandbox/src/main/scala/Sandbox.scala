import scala.language.existentials
import com.sap.marmolata.data.sql._
import com.sap.marmolata.data.types._
import com.sap.marmolata.erp._

object DataSandbox extends DBQueryExecutor  {


  val query = sql"select KUNNR FROM KNA1 WHERE KUNNR='5' LIMIT 10"

  def main(args: Array[String]): Unit = {
    val result = executeQuery(query)
    println(result.map(row => row.KUNNR.value).mkString(", "))
  }



}

