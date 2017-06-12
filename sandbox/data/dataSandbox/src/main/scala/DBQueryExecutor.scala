import com.sap.marmolata.data.access.{ExecuteQueryResult, JdbcSqlExecutionContext}

import scala.language.existentials
import com.sap.marmolata.data.sql._
import com.sap.marmolata.data.access.SqlExecutor.Implicits.JdbcSqlExecutor
import com.sap.marmolata.data.query.typed.ToUntypedOp._

import com.sap.marmolata.data.query.typed.Query
import com.sap.marmolata.data.access.Implicits._


import com.zaxxer.hikari.HikariDataSource
import scalikejdbc.ConnectionPool

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, Await}
import scala.concurrent.duration._


trait DBQueryExecutor {

  def shutdownDBPool(): Unit = {
    val jdbcCtx = implicitly[JdbcSqlExecutionContext]
    val pool = ConnectionPool.get(jdbcCtx.dataSourceName)
    pool.dataSource.asInstanceOf[HikariDataSource].close()
  }

  def executeQuery(query: Query) = {
    val untypedQuery = query.toUntyped
    println("--------Executing query--------")
    println(s"\nSQL: ${untypedQuery.toSQLString}")
    val futureRes = JdbcSqlExecutor
      .executeQuery(untypedQuery)
    val result = Await.result(futureRes, atMost = 15.second)
    val columns = result.metadata.columnNames.mkString(", ")
    println("SUCCESS")
    println(s"Column metadata: $columns")
    println(s"Number of rows retrieved: ${result.values.size}")
    println("Actual rows:")
    result.values.foreach(row =>
      println(row.mkString(", "))
    )
    println("\n-------------------------------\n")
    shutdownDBPool()
    result.values.map(row => query.mkRow(row.toArray))
  }
}
