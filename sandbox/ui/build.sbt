import sbt.Keys._
import sbt.Project
import com.sap.marmolata.sbt.Import._
import com.sap.marmolata.sbt.MarmolataRootProject
import PinPlugin.PinnableDependency

lazy val commonSettings = Seq(
  organization := "com.sap",
  version := "0.0.1-SNAPSHOT"
)

jsEnv in ThisBuild := new UI5SeleniumJSEnv(org.scalajs.jsenv.selenium.Chrome(), ui5Version.value, streams.value).withKeepAlive()

lazy val uiSandbox: Project = (project in file("js"))
  .enablePlugins(ScalaJSPlugin)
  .enablePlugins(MarmolataSbtPlugin)
  .settings(name := "uiSandbox",
            libraryDependencies += Dependencies.fastparse.value,
            libraryDependencies += Dependencies.scalatags.value,
            libraryDependencies += Dependencies.scalajs_jquery.value,
            libraryDependencies += Dependencies.shapeless.value,
            jsDependencies += ProvidedJS / "Canvas.js",
            jsDependencies += ProvidedJS / "DatePeriodParser.js",
            jsDependencies += ProvidedJS / "DatePeriodPick.js",
            jsDependencies += ProvidedJS / "MarmolataListBinding-dbg.js",
            jsDependencies += ProvidedJS / "MarmolataModel-dbg.js" dependsOn "MarmolataListBinding-dbg.js",  
            scalacOptions += "-Xfatal-warnings")
  .settings(commonSettings: _*)
  .pinnableDependsOn("com.sap.marmolata" %%%! "ui" % "0.5.0-dev.120")


lazy val root = (project in file("."))
  .enablePlugins(MarmolataSbtPlugin)
  .aggregate(uiSandbox)
  .settings(exportJars := false,
            publishArtifact := false,
            publish := {},
            publishTo := None,
            publishLocal := {})