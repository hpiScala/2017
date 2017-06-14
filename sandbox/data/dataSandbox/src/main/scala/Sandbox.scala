import scala.language.existentials
import com.sap.marmolata.data.sql._
import com.sap.marmolata.data.types._
import com.sap.marmolata.erp._
import com.sap.marmolata.data.access.{DataAccess, UnsecuredDataAccessOnServer}
import com.sap.marmolata.data.access.{ExecuteQueryResult, JdbcSqlExecutionContext}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, Await}
import scala.concurrent.duration._

object DataSandbox   {

  implicit val jdbcConfig = JdbcSqlExecutionContext(
    jdbcUrl="jdbc:sap://196.168.31.39:30215/?autocommit=false&currentschema=SAPHPB",
    jdbcUser=Some("STUDENTS"),
    jdbcPassword=Some("Enterprise2017"),
    sapClientId=Some("400")
  )
  
  import com.sap.marmolata.data.access.SqlExecutor.Implicits.JdbcSqlExecutor

  implicit val dataAccess = new UnsecuredDataAccessOnServer()

  val query = sql"select KUNNR FROM KNA1 LIMIT 10"

  def main(args: Array[String]): Unit = {

    val result = Await.result(query.execute, atMost = 15.second)
    val rowsAsString = result.map(row => row.KUNNR.value).mkString(", ")
    println(rowsAsString)
  }



}

