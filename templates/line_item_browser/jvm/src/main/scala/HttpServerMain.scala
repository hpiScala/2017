import com.sap.marmolata.app.MarmolataServer
import com.sap.marmolata.app.server.backend.{ServletBackend, StandaloneBackend}
import com.sap.marmolata.app.server.httpservice.BinaryAPIService
import com.sap.marmolata.authorization.abap.AbapAuthorizationType
import com.sap.marmolata.data.access.{JdbcSqlExecutionContext, SqlExecutor}
import com.sap.marmolata.data.access.Implicits._
import com.sap.marmolata.data.query.untyped.{QueryExecAPI, QueryExecAPIImpl}
import com.sap.marmolata.secureddata.query.DataSecurityHandler
import com.sap.marmolata.secureddata.query.exec.SecuredDataAccessOnServer
import scala.concurrent.{Future, ExecutionContext}


@MarmolataServer(QueryExecAPI, QueryExecAPIImpl)
object HybridServer extends StandaloneBackend with ServletBackend with BinaryAPIService {
  implicit def executionContext: ExecutionContext = ExecutionContext.global
  implicit val sqlExecutor2 = SqlExecutor.Implicits.JdbcSqlExecutor

  type AT = AbapAuthorizationType
  implicit def authContext(): AT#AuthContext = Future.successful{ErpUserContext("STUDENTS", "HE4", "400", None)}
  implicit def securityHandler(): DataSecurityHandler[AT] = DataSecurityHandler.handlerForAbapAuth
  implicit val dataAccess = new SecuredDataAccessOnServer[AT](
    () => DisplayLineItemsAuthSemantics.grantStatements
  )
}


