import com.sap.marmolata.app.MarmolataServer
import com.sap.marmolata.app.server.backend.{ServletBackend, StandaloneBackend}
import com.sap.marmolata.app.server.httpservice.{BinaryAPIService}
import com.sap.marmolata.authorization.abap.AbapAuthorizationType
import com.sap.marmolata.data.access.{SqlExecutor, JdbcSqlExecutionContext}
import com.sap.marmolata.data.access.Implicits._
import com.sap.marmolata.data.query.untyped.{QueryExecAPI}
import com.sap.marmolata.secureddata.query.DataSecurityHandler
import com.sap.marmolata.secureddata.query.exec.SecuredQueryExecAPIImpl
import scala.concurrent.{Future, ExecutionContext}


@MarmolataServer(QueryExecAPI, SecuredQueryExecAPIImpl)
object HybridServer extends StandaloneBackend with ServletBackend with BinaryAPIService {
  implicit def executionContext: ExecutionContext = ExecutionContext.global
  implicit val sqlExecutor2 = SqlExecutor.Implicits.JdbcSqlExecutor

  type AT = AbapAuthorizationType
  implicit def authContext(): AT#AuthContext = Future.successful{ErpUserContext("DEMO_USER", "HPB", "400", None)}
  def securityHandler: DataSecurityHandler[AT] = DataSecurityHandler.handlerForAbapAuth
}


