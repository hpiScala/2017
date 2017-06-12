import java.util.concurrent.TimeoutException

import org.openqa.selenium.WebElement
import org.scalajs.core.tools.io.{WritableMemVirtualJSFile, MemVirtualJSFile, VirtualJSFile}
import org.scalajs.core.tools.jsdep.ResolvedJSDependency
import org.scalajs.jsenv.{ComJSEnv, JSRunner, AsyncJSRunner, ComJSRunner}
import org.scalajs.jsenv.selenium._
import scala.annotation.tailrec
import scala.collection.JavaConversions._
import scala.concurrent.Await
import scala.concurrent.duration.Duration
import scala.util.{Failure, Success, Try}
import scala.util.control.NonFatal

trait Ui5SeleniumRunner extends AbstractSeleniumJSRunner {
  protected def _libs: Seq[ResolvedJSDependency]
  protected def _materializer: FileMaterializer
  protected def _code: VirtualJSFile
  protected val ui5Version: String

  override protected def initFiles(): Seq[VirtualJSFile] = {
    new MemVirtualJSFile("onLoadSetting").withContent(
      """
        | window.__SeleniumCommunicationObject = [ ];
        | window.__SeleniumCommunicationResponse = {
        |   addResponse: function(succ, fail) {
        |     window.__SeleniumCommunicationResponse.successFunctions.push(succ)
        |     window.__SeleniumCommunicationResponse.failureFunctions.push(fail)
        |   },
        |   callSuccess: function() {
        |     var t = window.__SeleniumCommunicationResponse.successFunctions
        |     window.__SeleniumCommunicationResponse.successFunctions = []
        |     window.__SeleniumCommunicationResponse.failureFunctions = []
        |     t.forEach(function(s) {
        |       s()
        |     })
        |   },
        |   callFailure: function(str) {
        |     var t = window.__SeleniumCommunicationResponse.failureFunctions
        |     window.__SeleniumCommunicationResponse.successFunctions = []
        |     window.__SeleniumCommunicationResponse.failureFunctions = []
        |     t.forEach(function(s) {
        |       s(str)
        |     })
        |   },
        |   successFunctions: [],
        |   failureFunctions: []
        | }
      """.stripMargin) +: super.initFiles()
  }

  override protected def htmlPage(jsFilesPaths: Seq[String]): VirtualJSFile = {
    val scriptTags = jsFilesPaths.map(path => s"<script src='$path'></script>")

    val ui5Script =
      s"""
        | <script src="https://sapui5.hana.ondemand.com/${ui5Version}/resources/sap-ui-core.js" type="text/javascript"
        |         id="sap-ui-bootstrap"
        |         data-sap-ui-theme="sap_bluecrystal"
        |         data-sap-ui-libs="sap.m,sap.ui.layout,sap.ui.comp,sap.ui.commons,sap.ui.table,sap.tnt"
        |         data-sap-debug="true"></script>
      """.stripMargin

      val (previous, after) = scriptTags.splitAt(2)

      val pageCode = {
      s"""<html>
          |  <meta charset="UTF-8">
          |  <body>
          |    ${previous.mkString("\n    ")}
          |    ${ui5Script}
          |    ${after.mkString("\n    ")}
          |  </body>
          |</html>
      """.stripMargin
    }

    new MemVirtualJSFile("scalajsRun.html").withContent(pageCode)
  }
}

class UI5SeleniumJSEnv(browser: SeleniumBrowser, ui5Version: String, logger: sbt.Keys.TaskStreams, keepAlive: Boolean = false, materializer: FileMaterializer = DefaultFileMaterializer) extends SeleniumJSEnv(browser) {
  override def withMaterializer(materializer: FileMaterializer): SeleniumJSEnv =
    new UI5SeleniumJSEnv(browser, ui5Version, logger, keepAlive, materializer)

  override def withKeepAlive(): SeleniumJSEnv =
    new UI5SeleniumJSEnv(browser, ui5Version, logger, true, materializer)

  override def jsRunner(libs: Seq[ResolvedJSDependency], code: VirtualJSFile): JSRunner = {
    val _ui5Version = ui5Version
    new SeleniumRunner(browser, libs, code, keepAlive, materializer) with Ui5SeleniumRunner {
      override protected def _libs: Seq[ResolvedJSDependency] = libs
      override protected def _code: VirtualJSFile = code
      override protected def _materializer: FileMaterializer = materializer
      val ui5Version = _ui5Version
    }
  }

  override def asyncRunner(libs: Seq[ResolvedJSDependency], code: VirtualJSFile): AsyncJSRunner = {
    val _ui5Version = ui5Version
    new SeleniumAsyncJSRunner(browser, libs, code, keepAlive, materializer) with Ui5SeleniumRunner {
      override protected def _libs: Seq[ResolvedJSDependency] = libs
      override protected def _code: VirtualJSFile = code
      override protected def _materializer: FileMaterializer = materializer
      val ui5Version = _ui5Version
    }
  }

  override def comRunner(libs: Seq[ResolvedJSDependency], code: VirtualJSFile): ComJSRunner = {
    val _ui5Version = ui5Version
    new SeleniumComJSRunner(browser, libs, code, keepAlive, materializer) with Ui5SeleniumRunner with SeleniumMessages {
      override protected def _libs: Seq[ResolvedJSDependency] = libs
      override protected def _code: VirtualJSFile = code
      override protected def _materializer: FileMaterializer = materializer
      val ui5Version = _ui5Version
      private final val MESSAGE_TAG = "M"
      private final val CLOSE_TAG = "CLOSE"

      private var comClosed = false

      private final val sendScript = {
        "var callback = arguments[arguments.length - 1];" +
        "this.scalajsSeleniumComJSRunnerChannel.recvMessage(arguments[0]);" +
        "callback();"
      }

      private final val receiveScript = {
        "var callback = arguments[arguments.length - 1];" +
        "callback(this.scalajsSeleniumComJSRunnerChannel.popOutMsg());"
      }

      override def send(msg: String): Unit = {
        if (comClosed)
          throw new ComJSEnv.ComClosedException
        awaitForBrowser()
        val encodedMsg =
          msg.replace("&", "&&").replace("\u0000", "&0")
        browser.getWebDriver.executeAsyncScript(sendScript, encodedMsg)
        browser.processConsoleLogs(console)
      }

      override def receive(timeout: Duration): String = {
        if (comClosed)
          throw new ComJSEnv.ComClosedException
        awaitForBrowser(timeout)
        @tailrec def loop(): String = {
          handleSeleniumCalls()
          Try(browser.getWebDriver.executeAsyncScript(receiveScript)) match {
            case Success(null) =>
              loop()

            case Success(msg: String) =>
              browser.processConsoleLogs(console)
              if (msg.startsWith(MESSAGE_TAG)) {
                val taglessMsg = msg.substring(MESSAGE_TAG.length)
                "&[0&]".r.replaceAllIn(taglessMsg, regMatch =>
                  if (regMatch.group(0) == "&&") "&" else "\u0000")
              } else if (msg == CLOSE_TAG) {
                throw new ComJSEnv.ComClosedException("Closed from browser.")
              } else {
                illFormattedScriptResult(msg)
              }

            case Success(obj) =>
              // Here we only try to get the console because it uses the same
              // communication channel that is potentially corrupted.
              Try(browser.processConsoleLogs(console))
              illFormattedScriptResult(obj)

            case Failure(exc) =>
              Try(browser.processConsoleLogs(console))
              logger.warn(s"exception $exc occured, ignoring")
              illFormattedScriptResult(exc)
          }
        }
        loop()
      }

      private def illFormattedScriptResult(obj: Any): Nothing = {
        throw new IllegalStateException(
          s"Receive ill formed message of type ${obj.getClass} with value: $obj")
      }

      override def close(): Unit = {
        browser.processConsoleLogs(console)
        comClosed = true
        if (!keepAlive || ignoreKeepAlive)
          browser.close()
      }

      //override protected def initFiles(): Seq[VirtualJSFile] =
      //  super.initFiles() :+ comSetupFile()

      private def handleSeleniumCalls(): Unit = {
        val webDriver = browser.getWebDriver
        val result = webDriver.executeScript("var result = window.__SeleniumCommunicationObject; window.__SeleniumCommunicationObject = []; return result")
        if (result == null) return ()
        result.asInstanceOf[java.util.List[_]].foreach { list =>
          Try {
            list match {
              case l: java.util.List[_] => handleMessage(l)
              case x =>
                throw new Exception(s"communication error: expected list but got ${if (x == null) "null" else x}")
            }
          } match {
            case Success(()) =>
              webDriver.executeScript("window.__SeleniumCommunicationResponse.callSuccess()")
            case Failure(z) =>
              println(s"fail ${z}")
              val msg = s"exception occured while executing messages ${list}: ${z}"
              webDriver.executeScript("window.__SeleniumCommunicationResponse.callFailure(arguments[0])", msg)
          }
        }
      }
    }
  }
}
