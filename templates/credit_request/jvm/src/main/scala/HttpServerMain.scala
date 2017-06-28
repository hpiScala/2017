import com.sap.marmolata.app.MarmolataServer
import com.sap.marmolata.app.server.backend.{StandaloneBackend, ServletBackend}
import com.sap.marmolata.app.server.httpservice.BinaryAPIService

import scala.concurrent.{Future, ExecutionContext}


@MarmolataServer(CreditRequestApi, CreditRequestApiImpl)
object HybridServer extends StandaloneBackend  with BinaryAPIService {
  implicit def executionContext: ExecutionContext = ExecutionContext.global
}
