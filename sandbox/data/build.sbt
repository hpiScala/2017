import sbt.Keys._
import sbt.Project
import com.sap.marmolata.sbt.Import._
import com.sap.marmolata.sbt.MarmolataRootProject

lazy val commonSettings = Seq(
  organization := "com.sap",
  version := "0.0.1-SNAPSHOT",
  scalaVersion in ThisBuild:= "2.11.8",
  isScalaJSProject := false,
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

lazy val dataSandbox: Project = (project in file("dataSandbox"))
  .enablePlugins(MarmolataSbtPlugin)
  .settings(commonSettings:_*)
  .settings(
    libraryDependencies += "com.sap.marmolata" %% "app" % "hpi-2",
    libraryDependencies += "com.sap.marmolata" %% "erp-custom-hpb" % "hpi-3"
  )

lazy val root = (project in file("."))
  .enablePlugins(MarmolataSbtPlugin)
  .aggregate(dataSandbox)
  .settings(commonSettings:_*)
  .settings(exportJars := false,
            publishArtifact := false,
            publish := {},
            publishTo := None,
            publishLocal := {}
            )