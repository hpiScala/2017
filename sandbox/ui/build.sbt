import sbt.Keys._
import sbt.Project
import com.sap.marmolata.sbt.Import._
import com.sap.marmolata.sbt.MarmolataRootProject

lazy val commonSettings = Seq(
  organization := "com.sap",
  version := "0.0.1-SNAPSHOT",
  resolvers := Seq(
    Resolver.url("local", new URL(Path.userHome.asFile.toURI.toURL + "/.ivy2/local"))(Resolver.ivyStylePatterns),
    DefaultMavenRepository,
    Resolver.sonatypeRepo("public"),
    Resolver.typesafeRepo("releases"),
    Resolver.sbtPluginRepo("releases"),
    "marmolata" at "http://vm-marmolata.eaalab.hpi.uni-potsdam.de/nexus/",
    "marmolata-alternative" at "https://jaheba.github.io/marmolata-mirror/nexus/"
  ),
  externalResolvers := resolvers.value
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
            libraryDependencies += "com.sap.marmolata" %%%! "ui" % "0.5.0-dev.120",
            jsDependencies += ProvidedJS / "Canvas.js",
            jsDependencies += ProvidedJS / "DatePeriodParser.js",
            jsDependencies += ProvidedJS / "DatePeriodPick.js",
            jsDependencies += ProvidedJS / "MarmolataListBinding-dbg.js",
            jsDependencies += ProvidedJS / "MarmolataModel-dbg.js" dependsOn "MarmolataListBinding-dbg.js",  
            scalacOptions += "-Xfatal-warnings")
  .settings(commonSettings: _*)



lazy val root = (project in file("."))
  .enablePlugins(MarmolataSbtPlugin)
  .aggregate(uiSandbox)
  .settings(commonSettings:_*)
  .settings(exportJars := false,
            publishArtifact := false,
            publish := {},
            publishTo := None,
            publishLocal := {})